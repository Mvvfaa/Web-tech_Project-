const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    displayName: {
      type: String,
      required: false,
      maxlength: [100, 'Display name cannot exceed 100 characters']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please provide a category']
    },
    theme: {
      type: String,
      required: [true, 'Please provide a theme'],
      enum: ['Classic', 'Love', 'Motivation', 'Ramadan', 'Valentine', 'Birthday', 'Amber', 'Cat'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: Number.isFinite,
        message: 'Price must be a valid number'
      }
    },
    image: {
      type: String,
      required: [true, 'Please provide a product image']
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    sizes: {
      type: [String],
      required: false,
      default: ['Small', 'Medium', 'Large']
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0
    },
    reviews: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Index for better query performance
productSchema.index({ category: 1, theme: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);