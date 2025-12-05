require('dotenv').config();
const express = require('express');

const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');

// Example use:
// const newCategory = new Category({ name: 'Candles', description: 'Scented candles' });
// await newCategory.save();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware (optional, for JSON bodies)
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Route example
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});