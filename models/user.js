// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please provide name'] },
  email: { type: String, required: [true, 'Please provide email'], unique: true, lowercase: true },
  password: { type: String, required: [true, 'Please provide password'], minlength: 6, select: false },
  role: { type: String, enum: ['user','admin'], default: 'user' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);