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

exports.createProduct = async (req, res) => {
  try {
    // If using multipart/form-data, multer places file on req.file
    if (req.file) {
      // Build public URL if serving local uploads
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
    // Optional: cleanup local image file when product deleted
    // Only try removal if product.image is a local /uploads URL (not http(s) to a remote cloud)
    try {
      if (product.image && product.image.includes('/uploads/')) {
        const filename = product.image.split('/uploads/').pop();
        const filepath = path.join(__dirname, '..', 'uploads', filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }
    } catch (cleanupErr) {
      // Log cleanup error but don't fail deletion
      console.warn('Image cleanup failed:', cleanupErr.message);
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


// Update product
exports.updateProduct = async (req, res) => {
  try {
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

// Delete product (soft delete)
// exports.deleteProduct = async (req, res) => {
//   try {
//     const product = await Product.findOneAndUpdate(
//       { _id: req.params.id, isActive: true },
//       { isActive: false },
//       { new: true }
//     );
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: 'Product not found'
//       });
//     }
//     res.status(200).json({
//       success: true,
//       message: 'Product deleted successfully'
//     });
//   } catch (error) {
//     if (error.name === 'CastError') {
//       return res.status(400).json({ success: false, message: 'Invalid product ID format' });
//     }
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };