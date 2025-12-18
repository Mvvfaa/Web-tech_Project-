require('dotenv').config();
const express = require('express');

const mongoose = require('mongoose');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Serve static frontend
app.use(express.static(path.join(__dirname, 'Frontend (Candelco.)')));
app.use('/api/auth', require('./routes/auth'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('^_^ MongoDB connected successfully'))
  .catch(err => console.log('X MongoDB connection error:', err));

// capture raw body for debugging + keep normal parsing
app.use(express.json({
  verify: (req, res, buf) => {
    // attach rawBody for later inspection (if any)
    try { req.rawBody = buf.toString(); } catch (e) { req.rawBody = undefined; }
  }
}));

app.use(express.urlencoded({ extended: true }));

// Import Routes
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const mediaRoutes = require('./routes/media');
const searchRoutes = require('./routes/search');
const authRoutes = require('./routes/auth');

// API Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);

// Serve uploaded files once (remove duplicate)
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