const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['approval', 'rejection', 'download', 'announcement', 'comment', 'mention', 'milestone'], required: true },
  title: { type: String, required: true, maxlength: 100 },
  message: { type: String, required: true, maxlength: 500 },
  link: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  isRead: { type: Boolean, default: false },
  isEmailSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
