const router = require('express').Router();
const Product = require('../models/Product');

const FIELDS = ['name', 'sku', 'category', 'price', 'quantity', 'lowStockThreshold', 'supplier', 'description'];
const SORTABLE = ['name', 'sku', 'category', 'price', 'quantity', 'createdAt', 'updatedAt'];

const pick = (body) => Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const LOW = { $and: [{ $gt: ['$quantity', 0] }, { $lte: ['$quantity', '$lowStockThreshold'] }] };
const IN = { $gt: ['$quantity', '$lowStockThreshold'] };

// List with search, filters, sorting and pagination
router.get('/', async (req, res, next) => {
  try {
    const { search, category, status, sort = 'createdAt', order = 'desc' } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

    const filter = {};
    if (category) filter.category = category;
    if (search && search.trim()) {
      const rx = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ name: rx }, { sku: rx }, { supplier: rx }];
    }
    if (status === 'out') filter.quantity = 0;
    else if (status === 'low') filter.$expr = LOW;
    else if (status === 'in') filter.$expr = IN;

    const sortField = SORTABLE.includes(sort) ? sort : 'createdAt';
    const total = await Product.countDocuments(filter);
    const pages = Math.max(Math.ceil(total / limit), 1);
    const page = Math.min(Math.max(parseInt(req.query.page) || 1, 1), pages);

    const items = await Product.find(filter)
      .collation({ locale: 'en' })
      .sort({ [sortField]: order === 'asc' ? 1 : -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ items, total, page, pages, limit });
  } catch (err) {
    next(err);
  }
});

// Dashboard stats
router.get('/stats', async (req, res, next) => {
  try {
    const [totals] = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalUnits: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } },
          outOfStock: { $sum: { $cond: [{ $eq: ['$quantity', 0] }, 1, 0] } },
          lowStock: { $sum: { $cond: [LOW, 1, 0] } },
        },
      },
    ]);

    const byCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          units: { $sum: '$quantity' },
          value: { $sum: { $multiply: ['$price', '$quantity'] } },
        },
      },
      { $project: { _id: 0, category: '$_id', count: 1, units: 1, value: 1 } },
      { $sort: { value: -1 } },
    ]);

    const attention = await Product.find({ $expr: { $lte: ['$quantity', '$lowStockThreshold'] } })
      .sort({ quantity: 1 })
      .limit(6);

    res.json({
      totalProducts: totals?.totalProducts || 0,
      totalUnits: totals?.totalUnits || 0,
      totalValue: totals?.totalValue || 0,
      lowStock: totals?.lowStock || 0,
      outOfStock: totals?.outOfStock || 0,
      byCategory,
      attention,
    });
  } catch (err) {
    next(err);
  }
});

// Distinct categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories.sort((a, b) => a.localeCompare(b)));
  } catch (err) {
    next(err);
  }
});

// Create
router.post('/', async (req, res, next) => {
  try {
    res.status(201).json(await Product.create(pick(req.body)));
  } catch (err) {
    next(err);
  }
});

// Update
router.put('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { $set: pick(req.body) }, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Adjust stock by +/- delta
router.patch('/:id/stock', async (req, res, next) => {
  try {
    const delta = Number(req.body.delta);
    if (!Number.isInteger(delta)) return res.status(400).json({ message: 'delta must be an integer' });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.quantity = Math.max(0, product.quantity + delta);
    await product.save();
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Delete
router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
