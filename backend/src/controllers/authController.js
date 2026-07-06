const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// Helper to sign JWT
const getSignedJwtToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'kslu_circle_super_secret_key_change_me_in_production',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Helper to match passwords
const matchPassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

// Cookie settings helper
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

// Send JWT token in cookie
const sendTokenResponse = async (user, statusCode, req, res, actionType) => {
  const token = getSignedJwtToken(user);
  const options = getCookieOptions();

  // Create audit log
  try {
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: actionType,
        targetId: user.id,
        targetType: 'user',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    });
  } catch (err) {
    logger.error(`Failed to audit log activity '${actionType}': ${err.message}`);
  }

  // Update last active
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
    });
  } catch (err) {
    logger.error(`Failed to update lastActive for user ${user.id}: ${err.message}`);
  }

  // Clean password before sending response
  const sanitizedUser = { ...user };
  delete sanitizedUser.password;

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: sanitizedUser
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, college, yearOfStudy } = req.body;

    const emailLower = email.toLowerCase();

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = crypto.randomBytes(30).toString('hex');
    const verificationTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user in PostgreSQL
    const user = await prisma.user.create({
      data: {
        name,
        email: emailLower,
        password: hashedPassword,
        college,
        yearOfStudy: yearOfStudy ? parseInt(yearOfStudy) : null,
        verificationToken,
        verificationTokenExpire
      }
    });

    // Send emails
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyUrl = `${clientUrl}/verify-email/${verificationToken}`;
    await emailService.sendVerificationEmail(user, verifyUrl);
    await emailService.sendWelcomeEmail(user, `${clientUrl}/login`);

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
    const emailLower = email.toLowerCase();

    // Fetch user including password
    const user = await prisma.user.findUnique({
      where: { email: emailLower }
    });

    if (!user || !user.password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, error: 'Your account has been banned' });
    }

    // Match password
    const isMatch = await matchPassword(password, user.password);
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

    const emailLower = email.toLowerCase();

    // Check if user exists by googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email: emailLower }
        ]
      }
    });

    if (user) {
      // Connect Google ID if not connected
      if (!user.googleId || (avatar && !user.avatar)) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: user.googleId || googleId,
            avatar: user.avatar || avatar
          }
        });
      }
      if (user.isBanned) {
        return res.status(403).json({ success: false, error: 'Your account has been banned' });
      }
    } else {
      // Create user
      user = await prisma.user.create({
        data: {
          name,
          email: emailLower,
          googleId,
          avatar: avatar || '',
          college,
          yearOfStudy: yearOfStudy ? parseInt(yearOfStudy) : null,
          isVerified: true // Google accounts are pre-verified
        }
      });
      
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
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'logout',
          targetId: req.user.id,
          targetType: 'user',
          ip: req.ip,
          userAgent: req.headers['user-agent']
        }
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
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: req.params.token,
        verificationTokenExpire: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpire: null
      }
    });

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
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'No user registered with that email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(30).toString('hex');
    const resetTokenExpire = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpire: resetTokenExpire
      }
    });

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
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: req.params.token,
        resetPasswordExpire: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null
      }
    });

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
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (user) {
      delete user.password;
    }

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
    const { name, college, yearOfStudy, avatar, notificationPreferences } = req.body;

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (college !== undefined) dataToUpdate.college = college;
    if (yearOfStudy !== undefined) dataToUpdate.yearOfStudy = parseInt(yearOfStudy);
    if (avatar !== undefined) dataToUpdate.avatar = avatar;
    
    if (notificationPreferences) {
      if (notificationPreferences.email !== undefined) dataToUpdate.emailPref = !!notificationPreferences.email;
      if (notificationPreferences.inApp !== undefined) dataToUpdate.inAppPref = !!notificationPreferences.inApp;
      if (notificationPreferences.digest !== undefined) dataToUpdate.digestPref = !!notificationPreferences.digest;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: dataToUpdate
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'edit',
        targetId: updatedUser.id,
        targetType: 'user',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    delete updatedUser.password;

    res.status(200).json({
      success: true,
      user: updatedUser
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

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user || !user.password) {
      return res.status(401).json({ success: false, error: 'User password not set' });
    }

    const isMatch = await matchPassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect current password' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};
