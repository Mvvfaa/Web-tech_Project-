const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // existing auth middleware

const {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getMyOrders
} = require('../controllers/orderController');

router.get('/', getAllOrders);
router.get('/my-orders', auth, getMyOrders); // get authenticated user's orders
router.get('/:id', getOrder);
router.post('/', auth, createOrder); // protect create with auth
router.put('/:id', auth, updateOrder);
router.delete('/:id', auth, deleteOrder);

module.exports = router;