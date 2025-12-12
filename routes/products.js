const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

router.get('/', getAllProducts);
router.get('/:id', getProduct);
// Use upload.single('image') so createProduct receives req.file
router.post('/', upload.single('image'), createProduct);
// allow updating with a new image as well
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;