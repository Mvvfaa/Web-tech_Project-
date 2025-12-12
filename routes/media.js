const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadMedia } = require('../controllers/mediaController');

// POST /api/media/upload  -> accepts form-data with key "file"
router.post('/upload', upload.single('file'), uploadMedia);

module.exports = router;