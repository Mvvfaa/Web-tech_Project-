// controllers/searchController.js
const Product = require('../models/Product');
const Category = require('../models/Category');

exports.searchHandler = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res.status(400).json({ success: false, message: 'Query parameter q is required' });
    }

    // Search products by text index and categories by name
    const productPromise = Product.find({ $text: { $search: q }, isActive: true }).populate('category').limit(50);
    const categoryPromise = Category.find({ name: new RegExp(q, 'i'), isActive: true }).limit(20);

    const [products, categories] = await Promise.all([productPromise, categoryPromise]);

    res.status(200).json({ success: true, data: { products, categories } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};