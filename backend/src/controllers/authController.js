const crypto = require('crypto');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// Generate cookie options
const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    expires: new Date(
      Date.now() + (parseInt(process.env.COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  };
};

// Send JWT response with cookie
const sendTokenResponse = async (user, statusCode, req, res, actionType) => {
  const token = user.getSignedJwtToken();
  const options = getCookieOptions();

  // Create activity log
  try {
    await ActivityLog.create({
      user: user._id,
      action: actionType,
      targetId: user._id,
      targetType: 'user',
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  } catch (err) {
    logger.error(`Failed to log activity '${actionType}': ${err.message}`);
  }

  // Update last active
  user.lastActive = new Date();
  await user.save({ validateBeforeSave: false });

  // Remove password from response
  user.password = undefined;

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, college, yearOfStudy } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(30).toString('hex');
    const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user
    user = await User.create({
      name,
      email,
      password,
      college,
      yearOfStudy,
      verificationToken,
      verificationTokenExpire
    });

    // Send verification email
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyUrl = `${clientUrl}/verify-email/${verificationToken}`;
    await emailService.sendVerificationEmail(user, verifyUrl);

    // Send welcome email
    const loginLink = `${clientUrl}/login`;
    await emailService.sendWelcomeEmail(user, loginLink);

    await sendTokenResponse(user, 201, req, res, 'register');
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if banned
    if (user.isBanned) {
      return res.status(403).json({ success: false, error: 'Your account has been banned' });
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    await sendTokenResponse(user, 200, req, res, 'login');
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth mock/endpoint
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
  try {
    const { name, email, googleId, avatar, college, yearOfStudy } = req.body;
    if (!email || !googleId) {
      return res.status(400).json({ success: false, error: 'Email and Google ID are required' });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Connect Google ID if not already connected
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (avatar && !user.avatar) {
        user.avatar = avatar;
      }
      if (user.isBanned) {
        return res.status(403).json({ success: false, error: 'Your account has been banned' });
      }
      await user.save();
    } else {
      // Create user
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        college,
        yearOfStudy,
        isVerified: true // Google accounts are pre-verified
      });
      // Send welcome email
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      await emailService.sendWelcomeEmail(user, `${clientUrl}/login`);
    }

    await sendTokenResponse(user, 200, req, res, 'login');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Protected
exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      await ActivityLog.create({
        user: req.user._id,
        action: 'logout',
        targetId: req.user._id,
        targetType: 'user',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email token
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, error: 'No user registered with that email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(30).toString('hex');
    const resetTokenExpire = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpire;
    await user.save({ validateBeforeSave: false });

    // Send reset email
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
    await emailService.sendPasswordResetEmail(user, resetUrl);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to email'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully!'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Protected
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Protected
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      college: req.body.college,
      yearOfStudy: req.body.yearOfStudy,
      avatar: req.body.avatar,
      notificationPreferences: req.body.notificationPreferences
    };

    // Filter out undefined values
    Object.keys(fieldsToUpdate).forEach(
      key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'edit',
      targetId: user._id,
      targetType: 'user',
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Protected
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Provide current and new password' });
    }

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};
