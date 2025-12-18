require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // optional, helpful for local dev
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ---------- Body parsers (must be BEFORE any route mounts) ----------
// capture raw body for debugging (optional). Keep only one express.json call.
app.use(express.json({
  verify: (req, res, buf) => {
    try { req.rawBody = buf.toString(); } catch (e) { req.rawBody = undefined; }
  }
}));
app.use(express.urlencoded({ extended: true }));

// Optional: enable CORS for local development (remove or restrict in production)
app.use(cors()); // or app.use(cors({ origin: 'http://localhost:3000' }));

// Serve static frontend (same origin) - this is fine to keep here
app.use(express.static(path.join(__dirname, 'Frontend (Candelco.)')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('^_^ MongoDB connected successfully'))
  .catch(err => console.log('X MongoDB connection error:', err));

// Import Routes
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const mediaRoutes = require('./routes/media');
const searchRoutes = require('./routes/search');
const authRoutes = require('./routes/auth');

// API Routes (mounted AFTER body parsers)
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: '^_^ Server is running!' });
});

// Error Handling Middleware (last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`^_^ Server is running on port ${PORT}`);
});