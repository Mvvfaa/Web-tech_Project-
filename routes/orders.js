const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');

router.get('/', getAllOrders);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

module.exports = router;