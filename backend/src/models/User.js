const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, minlength: 6, select: false },
  googleId: { type: String, unique: true, sparse: true },
  avatar: { type: String, default: '' },
  college: { type: String, trim: true },
  yearOfStudy: { type: Number, min: 1, max: 10 },
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  totalDownloads: { type: Number, default: 0 },
  totalUploads: { type: Number, default: 0 },
  reputation: { type: Number, default: 0 },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
    digest: { type: Boolean, default: false }
  },
  verificationToken: String,
  verificationTokenExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || 'kslu_circle_super_secret_key_change_me_in_production',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = mongoose.model('User', UserSchema);
