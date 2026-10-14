import MenuItem from '../models/MenuItem.js';
import asyncHandler from '../utils/asyncHandler.js';
import httpError from '../utils/httpError.js';
import { uploadImage } from '../utils/uploadImage.js';
import { findSellerShop } from './shopController.js';

const parseBool = (value) => value === true || value === 'true';

// GET /api/menu/mine (seller)
export const listMyMenu = asyncHandler(async (req, res) => {
  const shop = await findSellerShop(req.user._id);
  const items = await MenuItem.find({ shop: shop._id }).sort({ createdAt: -1 }).lean();
  res.json(items);
});

// POST /api/menu (seller, multipart with optional "image")
export const createMenuItem = asyncHandler(async (req, res) => {
  const shop = await findSellerShop(req.user._id);
  const { name, description = '', price, category = 'General', isAvailable } = req.body;

  if (!name || price === undefined || price === '') {
    throw httpError(400, 'Name and price are required');
  }

  const item = await MenuItem.create({
    shop: shop._id,
    name: String(name).trim(),
    description: String(description).trim(),
    price: Number(price),
    category: String(category).trim() || 'General',
    image: await uploadImage(req.file),
    isAvailable: isAvailable === undefined ? true : parseBool(isAvailable),
  });

  res.status(201).json(item);
});

// PUT /api/menu/:id (seller)
export const updateMenuItem = asyncHandler(async (req, res) => {
  const shop = await findSellerShop(req.user._id);
  const item = await MenuItem.findOne({ _id: req.params.id, shop: shop._id });
  if (!item) throw httpError(404, 'Menu item not found');

  const { name, description, price, category, isAvailable } = req.body;
  if (name !== undefined) item.name = String(name).trim();
  if (description !== undefined) item.description = String(description).trim();
  if (price !== undefined && price !== '') item.price = Number(price);
  if (category !== undefined) item.category = String(category).trim() || 'General';
  if (isAvailable !== undefined) item.isAvailable = parseBool(isAvailable);
  if (req.file) item.image = await uploadImage(req.file);

  await item.save();
  res.json(item);
});

// DELETE /api/menu/:id (seller)
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const shop = await findSellerShop(req.user._id);
  const item = await MenuItem.findOneAndDelete({ _id: req.params.id, shop: shop._id });
  if (!item) throw httpError(404, 'Menu item not found');
  res.json({ message: 'Menu item deleted' });
});
