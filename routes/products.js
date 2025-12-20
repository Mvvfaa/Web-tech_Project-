const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

router.get('/', getAllProducts);
router.get('/:id', getProduct);



// Protected write routes
router.post('/', auth, upload.single('image'), createProduct);

router.post('/', auth, requireAdmin, createProduct); // only admin can create products

//router.post('/', auth, requireAdmin, upload.single('image'), createProduct); // use this if admin-only
router.put('/:id', auth, upload.single('image'), updateProduct);
router.delete('/:id', auth, deleteProduct);

module.exports = router;