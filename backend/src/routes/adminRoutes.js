const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getPendingMaterials,
  approveMaterial,
  rejectMaterial,
  toggleFeatureMaterial,
  deleteMaterialAdmin,
  getUsers,
  updateUserRole,
  toggleUserBan,
  deleteUser,
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  getAnalytics,
  exportAnalyticsCSV,
  getActivityLogs,
  updateSettings
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/admin');

// All admin routes require authentication and admin/superadmin roles
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/dashboard', getDashboardStats);
router.get('/pending', getPendingMaterials);
router.put('/materials/:id/approve', approveMaterial);
router.put('/materials/:id/reject', rejectMaterial);
router.put('/materials/:id/feature', toggleFeatureMaterial);
router.delete('/materials/:id', deleteMaterialAdmin);

router.get('/users', getUsers);
router.put('/users/:id/role', authorize('superadmin'), updateUserRole); 
router.put('/users/:id/ban', toggleUserBan);
router.delete('/users/:id', authorize('superadmin'), deleteUser);

router.post('/announcements', createAnnouncement);
router.get('/announcements', getAnnouncements);
router.put('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

router.get('/analytics', getAnalytics);
router.get('/analytics/export', exportAnalyticsCSV);
router.get('/activity-logs', getActivityLogs);
router.put('/settings', updateSettings);

module.exports = router;
