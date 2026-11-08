const express = require('express');
const router = express.Router();
const {
  getCourses,
  getSemesters,
  getSubjects,
  getSchemes,
  getPYQs,
  previewPYQ,
  downloadPYQ,
  syncGoogleDrive,
  getSyncStatus
} = require('../controllers/pyqController');
const { protect, optionalProtect } = require('../middleware/auth');
const { authorize } = require('../middleware/admin');
const { pyqStreamLimiter, pyqSyncLimiter } = require('../middleware/rateLimit');

// Public navigation & search endpoints
router.get('/courses', getCourses);
router.get('/semesters/:courseId', getSemesters);
router.get('/subjects/:semesterId', getSubjects);
router.get('/schemes/:subjectId', getSchemes);
router.get('/', optionalProtect, getPYQs);

// File streaming endpoints (rate-limited and with optional user tracking)
router.get('/:id/preview', pyqStreamLimiter, optionalProtect, previewPYQ);
router.get('/:id/download', pyqStreamLimiter, optionalProtect, downloadPYQ);

// Admin synchronization endpoints (also exposed at /api/admin/pyqs/*)
router.post('/sync', protect, authorize('admin', 'superadmin'), pyqSyncLimiter, syncGoogleDrive);
router.get('/sync-status', protect, authorize('admin', 'superadmin'), getSyncStatus);

module.exports = router;
