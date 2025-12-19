const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // existing auth middleware
const auth = require('../middleware/auth'); // add this

const {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');

router.get('/', getAllOrders);
router.get('/:id', getOrder);
router.post('/', auth, createOrder); // protect create with auth