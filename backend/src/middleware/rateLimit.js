const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, 
  legacyHeaders: false, 
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Stricter limiter for file streaming / PDF preview & downloads to prevent abuse
const pyqStreamLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120, // Max 120 streaming calls per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many file access requests. Please wait a few minutes before previewing or downloading more papers.'
  }
});

// Limiter for admin manual sync trigger
const pyqSyncLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Max 10 sync triggers per 5 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many synchronization requests. Please wait before triggering another sync.'
  }
});

module.exports = { apiLimiter, pyqStreamLimiter, pyqSyncLimiter };
