import Shop from '../models/Shop.js';
import MenuItem from '../models/MenuItem.js';
import asyncHandler from '../utils/asyncHandler.js';
import httpError from '../utils/httpError.js';
import { uploadImage } from '../utils/uploadImage.js';

// Returns the shop owned by a seller, or throws if the profile is not created yet
export const findSellerShop = async (userId) => {
  const shop = await Shop.findOne({ owner: userId });
  if (!shop) throw httpError(400, 'Create your shop profile first');
  return shop;
};

// GET /api/shops (public)
export const listShops = asyncHandler(async (req, res) => {
  const shops = await Shop.find().sort({ createdAt: -1 }).lean();
  res.json(shops);
});

// GET /api/shops/:id (public) – shop details plus its available menu
export const getShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id).lean();
  if (!shop) throw httpError(404, 'Shop not found');

  const menu = await MenuItem.find({ shop: shop._id, isAvailable: true })
    .sort({ category: 1, name: 1 })
    .lean();

  res.json({ shop, menu });
});

// GET /api/shops/mine (seller)
export const getMyShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ owner: req.user._id }).lean();
  res.json(shop || null);
});

// PUT /api/shops/mine (seller) – create or update the shop profile, optional image
export const upsertMyShop = asyncHandler(async (req, res) => {
  const { name, description, isOpen } = req.body;

  let shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) shop = new Shop({ owner: req.user._id });

  if (name !== undefined) shop.name = String(name).trim();
  if (description !== undefined) shop.description = String(description).trim();
  if (isOpen !== undefined) shop.isOpen = isOpen === true || isOpen === 'true';
  if (req.file) shop.image = await uploadImage(req.file);

  await shop.save();
  res.json(shop);
});
