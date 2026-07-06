const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { 
    type: String, 
    enum: ['upload', 'download', 'login', 'logout', 'register', 'view', 'upvote', 'comment', 'edit', 'delete', 'approve', 'reject'], 
    required: true 
  },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  targetType: { type: String, enum: ['note', 'paper', 'user', 'announcement'] },
  details: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
