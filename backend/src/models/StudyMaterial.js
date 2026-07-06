const mongoose = require('mongoose');

const StudyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['note', 'paper'], required: true },
  subjectCode: { type: String, required: true, uppercase: true, trim: true },
  subjectName: { type: String, trim: true },
  semester: { type: Number, min: 1, max: 10, required: true },
  university: { type: String, required: true, enum: ['KSLU', 'NLSIU', 'Christ', 'Other'] },
  year: { type: Number, min: 2000, max: 2026 },
  description: { type: String, maxlength: 1000 },
  tags: [{ type: String, trim: true }],
  fileUrl: { type: String, required: true },
  filePublicId: { type: String, required: true },
  fileSize: { type: Number },
  fileType: { type: String, default: 'application/pdf' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String, maxlength: 500 },
  downloads: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isFeatured: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudyMaterial', StudyMaterialSchema);
