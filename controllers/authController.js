// controllers/authController.js
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '8h' });
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success:false, message:'Email already used' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hash });
    const token = signToken(user._id);
    res.status(201).json({ success:true, data: { user: { id: user._id, name: user.name, email: user.email }, token } });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ success:false, message:'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success:false, message:'Invalid credentials' });
    const token = signToken(user._id);
    res.status(200).json({ success:true, data: { user: { id: user._id, name: user.name, email: user.email }, token } });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
};