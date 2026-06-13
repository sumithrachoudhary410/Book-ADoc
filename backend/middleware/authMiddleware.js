const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found', success: false });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed', success: false });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token', success: false });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admins only', success: false });
  }
};

const doctorOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'doctor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Doctors only', success: false });
  }
};

module.exports = { protect, adminOnly, doctorOnly };
