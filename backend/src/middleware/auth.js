const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Check cookie
  else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const parts = cookie.trim().split('=');
      if (parts.length >= 2) {
        const key = parts[0];
        const value = parts.slice(1).join('=');
        acc[key] = value;
      }
      return acc;
    }, {});
    token = cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'kslu_circle_super_secret_key_change_me_in_production'
    );
    
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User no longer exists' });
    }
    
    if (req.user.isBanned) {
      return res.status(403).json({ success: false, error: 'Your account has been banned by an admin' });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

module.exports = { protect };
