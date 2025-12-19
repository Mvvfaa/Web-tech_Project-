const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    // require authenticated user
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Authentication required to place an order' });
    }

    const {
      items: clientItems = [],
      shippingAddress,
      paymentMethod = 'Cash on Delivery',
      notes = '',
      customerName,
      customerEmail,
      customerPhone,
      shippingCost: clientShippingCost
    } = req.body;

    if (!Array.isArray(clientItems) || clientItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    // Build items with validated product references and compute subtotal
    const items = [];
    let subtotal = 0;

    for (const it of clientItems) {
      // expecting either productId or product (object containing _id)
      const productId = it.productId || it.product || it.product?._id;
      if (!productId) {
        return res.status(400).json({ success: false, message: 'Each order item must include productId' });
      }

      const productDoc = await Product.findById(productId).lean();
      if (!productDoc) {
        return res.status(400).json({ success: false, message: `Product not found: ${productId}` });
      }

      const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
      const price = Number(productDoc.price || it.price || 0);
      const itemSubtotal = price * qty;

      items.push({
        product: productDoc._id,
        name: productDoc.name,
        price,
        theme: it.theme || productDoc.theme || '',
        size: it.size || (productDoc.sizes && productDoc.sizes[0]) || '',
        quantity: qty,
        subtotal: itemSubtotal
      });

      subtotal += itemSubtotal;
    }

    const shippingCost = (typeof clientShippingCost === 'number') ? clientShippingCost : 250;
    const total = subtotal + shippingCost;

    // Validate required customer and address fields
    if (!customerName || !customerEmail || !customerPhone || !shippingAddress ||
        !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({ success: false, message: 'Missing customer or shipping address fields' });
    }

    const orderData = {
      user: req.user._id,
      items,
      subtotal,
      shippingCost,
      total,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod,
      notes
    };

    const order = await Order.create(orderData);
    res.status(201).json({ success: true, message: 'Order created successfully', data: order });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};