const StudyMaterial = require('../models/StudyMaterial');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const ActivityLog = require('../models/ActivityLog');
const { createNotification } = require('../services/notificationService');
const { deleteFile } = require('../services/fileService');
const logger = require('../utils/logger');

// @desc    Get dashboard summary counters
// @route   GET /api/admin/dashboard
// @access  Protected (Admin Only)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalUploads = await StudyMaterial.countDocuments();
    const pendingUploads = await StudyMaterial.countDocuments({ status: 'pending' });

    const downloadAggregate = await StudyMaterial.aggregate([
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);
    const totalDownloads = downloadAggregate.length > 0 ? downloadAggregate[0].total : 0;

    const recentPending = await StudyMaterial.find({ status: 'pending' })
      .populate('uploadedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentLogs = await ActivityLog.find()
      .populate('user', 'name role')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalUploads,
        pendingUploads,
        totalDownloads
      },
      recentPending,
      recentLogs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending materials
// @route   GET /api/admin/pending
// @access  Protected (Admin Only)
exports.getPendingMaterials = async (req, res, next) => {
  try {
    const materials = await StudyMaterial.find({ status: 'pending' })
      .populate('uploadedBy', 'name email avatar college reputation');
    res.status(200).json({
      success: true,
      count: materials.length,
      materials
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve material
// @route   PUT /api/admin/materials/:id/approve
// @access  Protected (Admin Only)
exports.approveMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    if (material.status === 'approved') {
      return res.status(400).json({ success: false, error: 'Material already approved' });
    }

    material.status = 'approved';
    material.approvedBy = req.user._id;
    material.approvedAt = Date.now();
    await material.save();

    // Award +10 reputation and increment uploads for the user who uploaded
    await User.findByIdAndUpdate(material.uploadedBy, {
      $inc: { reputation: 10, totalUploads: 1 }
    });

    // Create Notification and trigger email
    await createNotification({
      user: material.uploadedBy,
      type: 'approval',
      title: 'Material Approved! ✅',
      message: `Your file "${material.title}" has been approved and is now live!`,
      link: `/materials/${material._id}`,
      metadata: { material }
    });

    // Log Activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'approve',
      targetId: material._id,
      targetType: material.type,
      details: { title: material.title }
    });

    res.status(200).json({
      success: true,
      message: 'Material approved and published',
      material
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject material
// @route   PUT /api/admin/materials/:id/reject
// @access  Protected (Admin Only)
exports.rejectMaterial = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, error: 'Please provide a rejection reason' });
    }

    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    material.status = 'rejected';
    material.rejectionReason = reason;
    await material.save();

    // Create notification and trigger email
    await createNotification({
      user: material.uploadedBy,
      type: 'rejection',
      title: 'Upload Rejected ❌',
      message: `Your upload "${material.title}" was not approved. Reason: ${reason}`,
      link: `/profile`,
      metadata: { material, reason }
    });

    // Log Activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'reject',
      targetId: material._id,
      targetType: material.type,
      details: { title: material.title, reason }
    });

    res.status(200).json({
      success: true,
      message: 'Material rejected successfully',
      material
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle feature status
// @route   PUT /api/admin/materials/:id/feature
// @access  Protected (Admin Only)
exports.toggleFeatureMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    material.isFeatured = !material.isFeatured;
    await material.save();

    res.status(200).json({
      success: true,
      message: `Material is now ${material.isFeatured ? 'featured' : 'unfeatured'}`,
      material
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete material (Admin)
// @route   DELETE /api/admin/materials/:id
// @access  Protected (Admin Only)
exports.deleteMaterialAdmin = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    // Delete file using service
    await deleteFile(material.filePublicId);

    // If was approved, decrement total uploads count
    if (material.status === 'approved') {
      await User.findByIdAndUpdate(material.uploadedBy, { $inc: { totalUploads: -1 } });
    }

    await StudyMaterial.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Material deleted by administrator'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Protected (Admin Only)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Protected (SuperAdmin Only)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid user role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ban or Unban user
// @route   PUT /api/admin/users/:id/ban
// @access  Protected (Admin Only)
exports.toggleUserBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Prevent banning superadmins
    if (user.role === 'superadmin') {
      return res.status(400).json({ success: false, error: 'Superadmin cannot be banned' });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User has been ${user.isBanned ? 'banned' : 'unbanned'}`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Protected (SuperAdmin Only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.role === 'superadmin') {
      return res.status(400).json({ success: false, error: 'Superadmin cannot be deleted' });
    }

    // Delete all materials uploaded by user
    const materials = await StudyMaterial.find({ uploadedBy: user._id });
    for (const mat of materials) {
      await deleteFile(mat.filePublicId);
    }
    await StudyMaterial.deleteMany({ uploadedBy: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User and all associated materials deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create announcement
// @route   POST /api/admin/announcements
// @access  Protected (Admin Only)
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, type, expiresAt, isGlobal } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }

    const announcement = await Announcement.create({
      title,
      content,
      type,
      expiresAt,
      isGlobal,
      createdBy: req.user._id
    });

    // Notify all users if global
    if (isGlobal) {
      const users = await User.find({ isBanned: false });
      for (const u of users) {
        await createNotification({
          user: u._id,
          type: 'announcement',
          title: `New Announcement: ${title}`,
          message: content.substring(0, 100) + '...',
          link: '/',
          metadata: { announcement }
        });
      }
    }

    res.status(201).json({
      success: true,
      announcement
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all announcements
// @route   GET /api/admin/announcements
// @access  Protected (Admin/User)
exports.getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find().populate('createdBy', 'name').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      announcements
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement
// @route   PUT /api/admin/announcements/:id
// @access  Protected (Admin Only)
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }
    res.status(200).json({
      success: true,
      announcement
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/admin/announcements/:id
// @access  Protected (Admin Only)
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get advanced analytical data for Recharts
// @route   GET /api/admin/analytics
// @access  Protected (Admin Only)
exports.getAnalytics = async (req, res, next) => {
  try {
    // 1. Uploads per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const uploadsOverTime = await StudyMaterial.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2. Notes vs Papers distribution
    const typeDistribution = await StudyMaterial.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // 3. Uploads by subject (top 5)
    const subjectDistribution = await StudyMaterial.aggregate([
      { $group: { _id: '$subjectCode', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 4. Top users by reputation
    const topUsers = await User.find({ isBanned: false })
      .select('name email reputation totalUploads')
      .sort({ reputation: -1 })
      .limit(5);

    // 5. Active users over time (grouped by last active in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsersCount = await User.countDocuments({ lastActive: { $gte: sevenDaysAgo } });

    res.status(200).json({
      success: true,
      uploadsOverTime,
      typeDistribution,
      subjectDistribution,
      topUsers,
      activeUsersCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export analytics data as CSV file
// @route   GET /api/admin/analytics/export
// @access  Protected (Admin Only)
exports.exportAnalyticsCSV = async (req, res, next) => {
  try {
    const materials = await StudyMaterial.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    let csvContent = 'ID,Title,Type,Subject Code,Subject Name,Semester,University,Downloads,Views,Uploaded By,Email,Status,Uploaded At\n';

    materials.forEach(mat => {
      const uploaderName = mat.uploadedBy ? mat.uploadedBy.name : 'Unknown';
      const uploaderEmail = mat.uploadedBy ? mat.uploadedBy.email : 'Unknown';
      const escapedTitle = mat.title.replace(/"/g, '""');

      csvContent += `"${mat._id}","${escapedTitle}","${mat.type}","${mat.subjectCode}","${mat.subjectName || ''}",${mat.semester},"${mat.university}",${mat.downloads},${mat.views},"${uploaderName}","${uploaderEmail}","${mat.status}","${mat.createdAt.toISOString()}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=kslu_circle_analytics.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity logs
// @route   GET /api/admin/activity-logs
// @access  Protected (Admin Only)
exports.getActivityLogs = async (req, res, next) => {
  try {
    const { action, userId, targetType } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (userId) filter.user = userId;
    if (targetType) filter.targetType = targetType;

    const logs = await ActivityLog.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system settings (mock)
// @route   PUT /api/admin/settings
// @access  Protected (Admin Only)
exports.updateSettings = async (req, res, next) => {
  try {
    // Return success mock settings response
    res.status(200).json({
      success: true,
      message: 'System settings updated successfully',
      settings: req.body
    });
  } catch (error) {
    next(error);
  }
};
