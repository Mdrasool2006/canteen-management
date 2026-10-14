import Order, { ORDER_STATUSES } from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Shop from '../models/Shop.js';
import asyncHandler from '../utils/asyncHandler.js';
import httpError from '../utils/httpError.js';
import { findSellerShop } from './shopController.js';

const MAX_QTY_PER_ITEM = 20;

// POST /api/orders (customer)
// body: { shopId, note, items: [{ menuItemId, quantity }] }
export const placeOrder = asyncHandler(async (req, res) => {
  const { shopId, items, note = '' } = req.body;
  if (!shopId || !Array.isArray(items) || items.length === 0) {
    throw httpError(400, 'Choose a shop and at least one item');
  }

  const shop = await Shop.findById(shopId);
  if (!shop) throw httpError(404, 'Shop not found');
  if (!shop.isOpen) throw httpError(400, 'This shop is closed right now');

  // Always price items from the database, never from the client
  const menuItems = await MenuItem.find({
    _id: { $in: items.map((i) => i.menuItemId) },
    shop: shop._id,
    isAvailable: true,
  });
  const byId = new Map(menuItems.map((m) => [String(m._id), m]));

  let total = 0;
  const orderItems = items.map((it) => {
    const menuItem = byId.get(String(it.menuItemId));
    if (!menuItem) throw httpError(400, 'One of the selected items is unavailable');

    const quantity = Math.max(1, Math.min(MAX_QTY_PER_ITEM, parseInt(it.quantity, 10) || 1));
    total += menuItem.price * quantity;

    return { menuItem: menuItem._id, name: menuItem.name, price: menuItem.price, quantity };
  });

  const order = await Order.create({
    customer: req.user._id,
    shop: shop._id,
    items: orderItems,
    total,
    note: String(note).slice(0, 200),
  });

  res.status(201).json(order);
});

// GET /api/orders/my (customer)
export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id })
    .populate('shop', 'name image')
    .sort({ createdAt: -1 })
    .lean();
  res.json(orders);
});

// GET /api/orders/shop (seller)
export const shopOrders = asyncHandler(async (req, res) => {
  const shop = await findSellerShop(req.user._id);
  const orders = await Order.find({ shop: shop._id })
    .populate('customer', 'name phone email')
    .sort({ createdAt: -1 })
    .lean();
  res.json(orders);
});

// PATCH /api/orders/:id/status (seller)  body: { status }
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!ORDER_STATUSES.includes(status)) throw httpError(400, 'Invalid order status');

  const shop = await findSellerShop(req.user._id);
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, shop: shop._id },
    { status },
    { new: true }
  );
  if (!order) throw httpError(404, 'Order not found');

  res.json(order);
});
