const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { category, theme, search } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;
    if (theme) query.theme = theme;
    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query).populate('category');
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true }).populate('category');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create product (accepts multipart/form-data with file 'image' OR JSON body with image URL)
exports.createProduct = async (req, res) => {
  try {
    // If multer placed a file on req.file, set req.body.image to its public URL
    if (req.file) {
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      req.body.image = imageUrl;
    }

    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    // If updating with a new uploaded file, set req.body.image first (handled by route middleware)
    if (req.file) {
      req.body.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete product (soft delete) with optional image cleanup
exports.deleteProduct = async (req, res) => {
  try {
    // Soft-delete product
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      { isActive: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Optional cleanup: remove local file if image is stored in /uploads
    try {
      if (product.image && product.image.includes('/uploads/')) {
        const filename = product.image.split('/uploads/').pop();
        const filepath = path.join(__dirname, '..', 'uploads', filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }
    } catch (cleanupErr) {
      console.warn('Image cleanup failed:', cleanupErr.message);
      // don't fail the request because of cleanup failure
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};