const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // existing auth middleware
const {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');

router.get('/', getAllOrders);
router.get('/:id', getOrder);
// protect create so we know who placed it
router.post('/', auth, createOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

module.exports = router;