const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  material: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyMaterial', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bookmark', BookmarkSchema);
