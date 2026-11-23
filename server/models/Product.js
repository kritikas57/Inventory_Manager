const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 40 },
    category: { type: String, required: true, trim: true, maxlength: 50 },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 10 },
    supplier: { type: String, trim: true, maxlength: 100, default: '' },
    description: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
