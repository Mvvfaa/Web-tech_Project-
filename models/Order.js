const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 }
    }],
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    address: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    status: { type: String, default: "pending", enum: ["pending", "shipped", "delivered", "cancelled"] }
});

module.exports = mongoose.model('Order', orderSchema);