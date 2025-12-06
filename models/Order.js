const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Please provide a product']
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
    min: [0, 'Price cannot be negative']
  },
  theme: {
    type: String,
    required: false
  },
  size: {
    type: String,
    required: false
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    shippingCost: {
      type: Number,
      required: true,
      default: 250,
      min: [0, 'Shipping cost cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    },
    customerName: {
      type: String,
      required: [true, 'Please provide customer name'],
      trim: true
    },
    customerEmail: {
      type: String,
      required: [true, 'Please provide customer email'],
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    customerPhone: {
      type: String,
      required: [true, 'Please provide customer phone number']
    },
    shippingAddress: {
      street: {
        type: String,
        required: [true, 'Please provide street address']
      },
      city: {
        type: String,
        required: [true, 'Please provide city']
      },
      postalCode: {
        type: String,
        required: [true, 'Please provide postal code']
      },
      country: {
        type: String,
        required: [true, 'Please provide country'],
        default: 'Pakistan'
      }
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending'
    },
    paymentMethod: {
      type: String,
      enum: ['Cash on Delivery', 'Credit Card', 'Bank Transfer'],
      required: [true, 'Please provide payment method']
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending'
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);