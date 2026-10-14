// Creates demo accounts, a demo shop and sample menu items.
// Run with: npm run seed
// Safe to run more than once: demo accounts and the demo shop are updated, not duplicated.
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Shop from './models/Shop.js';
import MenuItem from './models/MenuItem.js';

const DEMO_PASSWORD = 'demo1234';

const DEMO_CUSTOMER = { name: 'Demo Customer', email: 'customer@demo.com' };
const DEMO_SELLER = { name: 'Demo Seller', email: 'seller@demo.com' };

const DEMO_SHOP = {
  name: 'Campus Bites',
  description: 'Quick snacks, hot meals and fresh drinks made every day.',
  isOpen: true,
};

const DEMO_MENU = [
  { name: 'Veg Sandwich', category: 'Snacks', price: 60, description: 'Grilled veggies with mint chutney' },
  { name: 'Masala Dosa', category: 'Meals', price: 80, description: 'Crispy dosa with potato masala and chutney' },
  { name: 'Veg Thali', category: 'Meals', price: 120, description: 'Rice, dal, two curries, roti and salad' },
  { name: 'Paneer Puff', category: 'Snacks', price: 35, description: 'Flaky pastry with spiced paneer' },
  { name: 'Samosa (2 pcs)', category: 'Snacks', price: 30, description: 'Hot and crispy with green chutney' },
  { name: 'Masala Chai', category: 'Drinks', price: 15, description: 'Ginger and cardamom tea' },
  { name: 'Cold Coffee', category: 'Drinks', price: 50, description: 'Chilled coffee with milk and ice' },
  { name: 'Fresh Lime Soda', category: 'Drinks', price: 40, description: 'Sweet or salted' },
];

async function upsertDemoUser({ name, email }, role, passwordHash) {
  return User.findOneAndUpdate(
    { email },
    { name, email, role, passwordHash, isVerified: true },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function seed() {
  await connectDB();
  console.log('✅ MongoDB connected');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await upsertDemoUser(DEMO_CUSTOMER, 'customer', passwordHash);
  const seller = await upsertDemoUser(DEMO_SELLER, 'seller', passwordHash);
  console.log('👤 Demo accounts ready');

  const shop = await Shop.findOneAndUpdate(
    { owner: seller._id },
    { ...DEMO_SHOP, owner: seller._id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`🏪 Demo shop ready: ${shop.name}`);

  // Replace the demo menu so re-running the seed keeps it consistent
  await MenuItem.deleteMany({ shop: shop._id });
  await MenuItem.insertMany(DEMO_MENU.map((item) => ({ ...item, shop: shop._id, isAvailable: true })));
  console.log(`🍱 ${DEMO_MENU.length} menu items added`);

  console.log('\nDemo login details (password for both: %s)', DEMO_PASSWORD);
  console.log('  Customer → customer@demo.com');
  console.log('  Seller   → seller@demo.com\n');
}

seed()
  .catch((err) => {
    console.error('❌ Seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());