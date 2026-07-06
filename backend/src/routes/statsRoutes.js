const express = require('express');
const router = express.Router();
const {
  getPublicStats,
  getSubjectCodes,
  getUniversities,
  getActiveAnnouncements
} = require('../controllers/statsController');

router.get('/stats', getPublicStats);
router.get('/subject-codes', getSubjectCodes);
router.get('/universities', getUniversities);
router.get('/announcements/active', getActiveAnnouncements);

module.exports = router;
