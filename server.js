require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); 
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json({
  verify: (req, res, buf) => {
    try { req.rawBody = buf.toString(); } catch (e) { req.rawBody = undefined; }
  }
}));
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use(express.static(path.join(__dirname, 'Frontend (Candelco.)')));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('^_^ MongoDB connected successfully'))
  .catch(err => console.log('X MongoDB connection error:', err));

const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const mediaRoutes = require('./routes/media');
const searchRoutes = require('./routes/search');
const authRoutes = require('./routes/auth');

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/test', (req, res) => {
  res.json({ message: '^_^ Server is running!' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`^_^ Server is running on port ${PORT}`);
});