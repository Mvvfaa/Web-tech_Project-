const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// Helper to remove a local uploads file (safe)
function removeLocalUpload(imageUrl) {
  if (!imageUrl || !imageUrl.includes('/uploads/')) return;
  const filename = imageUrl.split('/uploads/').pop();
  const filepath = path.join(__dirname, '..', 'uploads', filename);
  if (fs.existsSync(filepath)) {
    try { fs.unlinkSync(filepath); } catch (err) { console.warn('Failed to remove file:', filepath, err.message); }
  }
}

// Ensure numeric fields are cast if present
function normalizeNumericFields(body) {
  if (body.price !== undefined && body.price !== null && body.price !== '') {
    body.price = Number(body.price);
  }
  if (body.stock !== undefined && body.stock !== null && body.stock !== '') {
    body.stock = parseInt(body.stock, 10);
  }
  // Add other numeric fields if needed
}

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { category, theme, search } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;
    if (theme) query.theme = theme;
    if (search) query.$text = { $search: search };

    const products = await Product.find(query).populate('category');
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true }).populate('category');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create product (accepts multipart/form-data with file 'image' OR JSON body with image URL)
exports.createProduct = async (req, res) => {
  try {
    normalizeNumericFields(req.body);

    if (req.file) {
      // Store relative path instead of full URL for better portability
      const imageUrl = `/uploads/${req.file.filename}`;
      req.body.image = imageUrl;
    }

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: error.message });
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update product (cleans previous upload if replaced)
exports.updateProduct = async (req, res) => {
  try {
    normalizeNumericFields(req.body);

    // Find existing product to cleanup old image if needed
    const existing = await Product.findById(req.params.id);
    if (!existing || existing.isActive === false) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.file) {
      // remove old local upload if present
      removeLocalUpload(existing.image);
      req.body.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: error.message });
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete product (soft delete) with optional image cleanup
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // cleanup (remove file if local)
    try { removeLocalUpload(product.image); } catch (err) { console.warn('Cleanup error', err.message); }

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    res.status(500).json({ success: false, message: error.message });
  }
};