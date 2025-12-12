// middleware/errorHandler.js
module.exports = function (err, req, res, next) {
  // handle multer file filter / size errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large' });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message });
  }
  // other errors
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
};