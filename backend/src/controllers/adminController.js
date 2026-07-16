const { prisma } = require('../config/database');
const { createNotification } = require('../services/notificationService');
const logger = require('../utils/logger');

// @desc    Get stats summary & updates for admin home screen
// @route   GET /api/admin/dashboard
// @access  Protected (Admin Only)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalUploads = await prisma.studyMaterial.count({
      where: { status: 'approved' }
    });
    const pendingUploads = await prisma.studyMaterial.count({
      where: { status: 'pending' }
    });

    const downloadStats = await prisma.studyMaterial.aggregate({
      _sum: { downloads: true }
    });
    const totalDownloads = downloadStats._sum.downloads || 0;

    // Recent pending
    const rawPending = await prisma.studyMaterial.findMany({
      where: { status: 'pending' },
      include: {
        uploadedBy: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    const recentPending = rawPending.map(p => ({
      ...p,
      tags: p.tags ? p.tags.split(',') : []
    }));

    // Recent activity logs
    const recentLogs = await prisma.activityLog.findMany({
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

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

// @desc    Get all pending verification study materials
// @route   GET /api/admin/pending
// @access  Protected (Admin Only)
exports.getPendingMaterials = async (req, res, next) => {
  try {
    const rawMaterials = await prisma.studyMaterial.findMany({
      where: { status: 'pending' },
      include: {
        uploadedBy: {
          select: { id: true, name: true, avatar: true, reputation: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const materials = rawMaterials.map(m => ({
      ...m,
      tags: m.tags ? m.tags.split(',') : []
    }));

    res.status(200).json({
      success: true,
      count: materials.length,
      materials
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve and publish material
// @route   PUT /api/admin/materials/:id/approve
// @access  Protected (Admin Only)
exports.approveMaterial = async (req, res, next) => {
  try {
    const material = await prisma.studyMaterial.findUnique({
      where: { id: req.params.id }
    });

    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    if (material.status === 'approved') {
      return res.status(400).json({ success: false, error: 'Material is already approved' });
    }

    const updated = await prisma.studyMaterial.update({
      where: { id: material.id },
      data: {
        status: 'approved',
        approvedById: req.user.id,
        approvedAt: new Date()
      }
    });

    // Award reputation stars & increment totals
    await prisma.user.update({
      where: { id: material.uploadedById },
      data: {
        reputation: { increment: 10 },
        totalUploads: { increment: 1 }
      }
    });

    // Create Notification
    await createNotification({
      user: material.uploadedById,
      type: 'approval',
      title: 'Upload Approved! 🏆',
      message: `Your upload "${material.title}" has been verified and published. You gained 10 reputation stars!`,
      link: `/materials/${material.id}`
    });

    // Audit logs
    try {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'approve',
          targetId: material.id,
          targetType: material.type,
          details: JSON.stringify({ title: material.title })
        }
      });
    } catch (err) {}

    res.status(200).json({
      success: true,
      message: 'Material approved and published successfully',
      material: updated
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

    const material = await prisma.studyMaterial.findUnique({
      where: { id: req.params.id }
    });

    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    const updated = await prisma.studyMaterial.update({
      where: { id: material.id },
      data: {
        status: 'rejected',
        rejectionReason: reason
      }
    });

    // Create notification
    await createNotification({
      user: material.uploadedById,
      type: 'rejection',
      title: 'Upload Rejected ⚠️',
      message: `Your upload "${material.title}" was rejected. Reason: ${reason}`,
      link: '/profile'
    });

    // Audit log
    try {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'reject',
          targetId: material.id,
          targetType: material.type,
          details: JSON.stringify({ reason })
        }
      });
    } catch (err) {}

    res.status(200).json({
      success: true,
      message: 'Material submission rejected successfully',
      material: updated
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
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });

    // Sanitize passwords
    users.forEach(u => delete u.password);

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user role
// @route   PUT /api/admin/users/:id/role
// @access  Protected (SuperAdmin Only)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role assignment' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role }
    });

    delete updated.password;

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ban / Unban user
// @route   PUT /api/admin/users/:id/ban
// @access  Protected (Admin Only)
exports.toggleUserBan = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.role === 'superadmin') {
      return res.status(400).json({ success: false, error: 'Superadmin account cannot be banned' });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isBanned: !user.isBanned }
    });

    delete updated.password;

    res.status(200).json({
      success: true,
      message: updated.isBanned ? 'User has been banned' : 'User access restored',
      user: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user profile permanently
// @route   DELETE /api/admin/users/:id
// @access  Protected (SuperAdmin Only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.role === 'superadmin') {
      return res.status(400).json({ success: false, error: 'Superadmin account cannot be deleted' });
    }

    // Delete all files uploaded by this user from Cloudinary & local storage
    const { deleteFile } = require('../services/fileService');
    const userMaterials = await prisma.studyMaterial.findMany({
      where: { uploadedById: user.id }
    });

    for (const mat of userMaterials) {
      if (mat.filePublicId) {
        await deleteFile(mat.filePublicId);
      }
    }

    await prisma.user.delete({ where: { id: user.id } });

    res.status(200).json({
      success: true,
      message: 'User account and all uploaded files deleted successfully from database and Cloudinary'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create global alert banner
// @route   POST /api/admin/announcements
// @access  Protected (Admin Only)
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, type, expiresAt, isGlobal } = req.body;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type: type || 'info',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isGlobal: isGlobal !== undefined ? !!isGlobal : true,
        createdById: req.user.id
      }
    });

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
// @access  Protected (Admin Only)
exports.getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      announcements
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement details
// @route   PUT /api/admin/announcements/:id
// @access  Protected (Admin Only)
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const { title, content, type, expiresAt, isActive } = req.body;

    const announcement = await prisma.announcement.findUnique({ where: { id: req.params.id } });
    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    const dataToUpdate = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (content !== undefined) dataToUpdate.content = content;
    if (type !== undefined) dataToUpdate.type = type;
    if (expiresAt !== undefined) dataToUpdate.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isActive !== undefined) dataToUpdate.isActive = !!isActive;

    const updated = await prisma.announcement.update({
      where: { id: announcement.id },
      data: dataToUpdate
    });

    res.status(200).json({
      success: true,
      announcement: updated
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
    const announcement = await prisma.announcement.findUnique({ where: { id: req.params.id } });
    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    await prisma.announcement.delete({ where: { id: announcement.id } });

    res.status(200).json({
      success: true,
      message: 'Announcement deleted'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chart statistics
// @route   GET /api/admin/analytics
// @access  Protected (Admin Only)
exports.getAnalytics = async (req, res, next) => {
  try {
    // 1. Uploads frequency by day over the last 30 days
    // Neon PostgreSQL trunc date grouping
    const uploadsOverTime = await prisma.$queryRaw`
      SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as "_id", COUNT(*)::int as "count"
      FROM "StudyMaterial"
      WHERE "createdAt" > NOW() - INTERVAL '30 days'
      GROUP BY "_id"
      ORDER BY "_id" ASC
    `;

    // 2. Resource splits (notes vs papers)
    const typeDistribution = await prisma.studyMaterial.groupBy({
      by: ['type'],
      _count: { id: true }
    });
    const formattedType = typeDistribution.map(item => ({
      _id: item.type,
      count: item._count.id
    }));

    // 3. Uploads counts by subject
    const subjectDistribution = await prisma.studyMaterial.groupBy({
      by: ['subjectCode'],
      _count: { id: true },
      orderBy: {
        _count: { id: 'desc' }
      },
      take: 5
    });
    const formattedSubject = subjectDistribution.map(item => ({
      _id: item.subjectCode,
      count: item._count.id
    }));

    res.status(200).json({
      success: true,
      uploadsOverTime: uploadsOverTime || [],
      typeDistribution: formattedType,
      subjectDistribution: formattedSubject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export activity log to CSV file format
// @route   GET /api/admin/analytics/export
// @access  Protected (Admin Only)
exports.exportAnalyticsCSV = async (req, res, next) => {
  try {
    const logs = await prisma.activityLog.findMany({
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    let csvContent = 'ID,User Name,User Email,Action,Target ID,Target Type,Details,IP Address,Browser footprint,Timestamp\n';

    logs.forEach(log => {
      const uName = log.user ? `"${log.user.name.replace(/"/g, '""')}"` : 'Guest';
      const uEmail = log.user ? log.user.email : 'N/A';
      const details = log.details ? `"${log.details.replace(/"/g, '""')}"` : '';
      const uAgent = log.userAgent ? `"${log.userAgent.replace(/"/g, '""')}"` : '';

      csvContent += `${log.id},${uName},${uEmail},${log.action},${log.targetId || ''},${log.targetType || ''},${details},${log.ip || ''},${uAgent},${log.createdAt.toISOString()}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=kslu_circle_activity_audit.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle feature status of material
// @route   PUT /api/admin/materials/:id/feature
// @access  Protected (Admin Only)
exports.toggleFeatureMaterial = async (req, res, next) => {
  try {
    const material = await prisma.studyMaterial.findUnique({
      where: { id: req.params.id }
    });

    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    const updated = await prisma.studyMaterial.update({
      where: { id: material.id },
      data: { isFeatured: !material.isFeatured }
    });

    res.status(200).json({
      success: true,
      message: updated.isFeatured ? 'Material featured on home' : 'Material unfeatured',
      material: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete material by admin
// @route   DELETE /api/admin/materials/:id
// @access  Protected (Admin Only)
exports.deleteMaterialAdmin = async (req, res, next) => {
  try {
    const material = await prisma.studyMaterial.findUnique({
      where: { id: req.params.id }
    });

    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    // Delete from Cloudinary / local storage
    const { deleteFile } = require('../services/fileService');
    if (material.filePublicId) {
      await deleteFile(material.filePublicId);
    }

    // Decrement uploader's totalUploads (if approved)
    if (material.status === 'approved' && material.uploadedById) {
      try {
        await prisma.user.update({
          where: { id: material.uploadedById },
          data: { totalUploads: { decrement: 1 } }
        });
      } catch (err) {
        logger.error(`Failed to update totalUploads count: ${err.message}`);
      }
    }

    await prisma.studyMaterial.delete({
      where: { id: material.id }
    });

    res.status(200).json({
      success: true,
      message: 'Material deleted successfully from database and Cloudinary'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all activity logs
// @route   GET /api/admin/activity-logs
// @access  Protected (Admin Only)
exports.getActivityLogs = async (req, res, next) => {
  try {
    const { action } = req.query;
    const where = {};
    if (action) where.action = action;

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system settings (mockup)
// @route   PUT /api/admin/settings
// @access  Protected (Admin Only)
exports.updateSettings = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'System settings updated successfully on the database cluster.'
    });
  } catch (error) {
    next(error);
  }
};
