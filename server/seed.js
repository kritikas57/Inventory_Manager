// Fills the database with sample products: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const data = [
  ['Wireless Mouse', 'ELE-001', 'Electronics', 24.99, 120, 20, 'Logix Supply'],
  ['Mechanical Keyboard', 'ELE-002', 'Electronics', 89.0, 8, 15, 'Logix Supply'],
  ['USB-C Hub 7-in-1', 'ELE-003', 'Electronics', 39.5, 45, 15, 'TechParts Co'],
  ['27" Monitor', 'ELE-004', 'Electronics', 219.99, 0, 5, 'ViewMax'],
  ['Noise Cancelling Headphones', 'ELE-005', 'Electronics', 149.0, 18, 10, 'SoundWave'],
  ['Ergonomic Office Chair', 'FUR-001', 'Furniture', 189.0, 14, 5, 'Comfort Seating'],
  ['Standing Desk', 'FUR-002', 'Furniture', 349.0, 4, 5, 'Comfort Seating'],
  ['Bookshelf (5-tier)', 'FUR-003', 'Furniture', 79.0, 22, 5, 'HomeBuild'],
  ['A4 Copy Paper (500 sheets)', 'STA-001', 'Stationery', 5.49, 310, 100, 'PaperPlus'],
  ['Ballpoint Pens (12 pack)', 'STA-002', 'Stationery', 3.99, 64, 50, 'PaperPlus'],
  ['Sticky Notes (6 pack)', 'STA-003', 'Stationery', 4.25, 0, 40, 'PaperPlus'],
  ['Whiteboard Markers (8 pack)', 'STA-004', 'Stationery', 7.5, 36, 30, 'PaperPlus'],
  ['Stainless Water Bottle', 'KIT-001', 'Kitchen', 16.0, 90, 25, 'HomeBuild'],
  ['Coffee Maker', 'KIT-002', 'Kitchen', 59.99, 12, 10, 'BrewCo'],
  ['Ceramic Mug Set (4)', 'KIT-003', 'Kitchen', 21.0, 7, 15, 'BrewCo'],
].map(([name, sku, category, price, quantity, lowStockThreshold, supplier]) => ({
  name, sku, category, price, quantity, lowStockThreshold, supplier,
}));

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany({});
  await Product.insertMany(data);
  console.log(`Seeded ${data.length} products`);
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
