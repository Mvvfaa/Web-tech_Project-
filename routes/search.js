const express = require('express');
const router = express.Router();
const { searchHandler, filterAndSort, getAllCategories } = require('../controllers/searchController');

router.get('/', searchHandler);
router.get('/filter-sort', filterAndSort);
router.get('/debug/categories', getAllCategories);

module.exports = router;