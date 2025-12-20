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

// Debug: Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    console.log('All categories:', categories);
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Filter and Sort Products
exports.filterAndSort = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    
    console.log('=== Filter Request ===');
    console.log('Filter params:', { category, search, sort });
    
    // Build filter object
    let filter = { isActive: true };

    // Add category filter
    if (category && category !== 'all') {
      console.log('Filtering by category:', category);
      
      // Try to find category by name first
      let categoryDoc = null;
      
      // Direct name match (case-insensitive)
      categoryDoc = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') });
      
      if (!categoryDoc) {
        // Try fuzzy match
        categoryDoc = await Category.findOne({ name: new RegExp(category, 'i') });
      }
      
      console.log('Category lookup result:', categoryDoc);
      
      if (categoryDoc) {
        filter.category = categoryDoc._id;
        console.log('Set filter.category to ObjectId:', filter.category);
      } else {
        console.log('WARNING: Category not found, skipping category filter');
      }
    }

    console.log('Final filter object:', JSON.stringify(filter));

    // Add search filter
    if (search && search.trim()) {
      const searchTerm = search.trim();
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { displayName: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Build sort object
    let sortObj = {};
    if (sort === 'name-asc') {
      sortObj = { displayName: 1 };
    } else if (sort === 'name-desc') {
      sortObj = { displayName: -1 };
    } else if (sort === 'price-asc') {
      sortObj = { price: 1 };
    } else if (sort === 'price-desc') {
      sortObj = { price: -1 };
    } else {
      sortObj = { createdAt: -1 };
    }

    // Fetch products
    const products = await Product.find(filter).sort(sortObj);

    console.log(`Query result: Found ${products.length} products`);
    if (products.length > 0) {
      console.log('First product category:', products[0].category);
    }

    res.status(200).json({
      success: true,
      data: products,
      count: products.length,
      filter: filter // Include filter in response for debugging
    });
  } catch (err) {
    console.error('Filter error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};