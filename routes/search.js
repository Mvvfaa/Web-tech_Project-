// routes/search.js
const express = require('express');
const router = express.Router();
const { searchHandler } = require('../controllers/searchController');

router.get('/', searchHandler);

module.exports = router;