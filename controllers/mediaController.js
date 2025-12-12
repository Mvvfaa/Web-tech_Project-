// controllers/mediaController.js
exports.uploadMedia = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(201).json({ success: true, data: { filename: req.file.filename, url } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};