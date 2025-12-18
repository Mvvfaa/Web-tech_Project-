const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES || '8h';
  return jwt.sign({ id: userId }, secret, { expiresIn });
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    email = String(email).toLowerCase().trim();

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(String(password), salt);

    const user = await User.create({ name, email, password: hash });

    const token = signToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      }
    });
  } catch (err) {
    // Handle duplicate key (unique email)
    if (err && err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    email = String(email).toLowerCase().trim();

    const user = await User.findOne({ email, isActive: true }).select('+password');
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(String(password), user.password);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user._id);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me (protected)
exports.me = async (req, res) => {
  try {
    const u = req.user;
    if (!u) return res.status(401).json({ success: false, message: 'Not authorized' });
    res.status(200).json({
      success: true,
      data: { id: u._id, name: u.name, email: u.email, role: u.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};