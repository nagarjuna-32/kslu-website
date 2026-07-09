const { prisma } = require('../config/database');
const { uploadFile, deleteFile } = require('../services/fileService');
const { createNotification } = require('../services/notificationService');
const logger = require('../utils/logger');

// Helper to update user reputation
const updateUserReputation = async (userId, points) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { reputation: { increment: points } }
    });
  } catch (err) {
    logger.error(`Failed to update reputation for user ${userId}: ${err.message}`);
  }
};

// @desc    Get all approved materials (with pagination, filtering, searching, sorting)
// @route   GET /api/materials
// @access  Public
exports.getMaterials = async (req, res, next) => {
  try {
    const { 
      type, 
      semester, 
      university, 
      subjectCode, 
      search, 
      sortBy, 
      page = 1, 
      limit = 10 
    } = req.query;

    const where = { status: 'approved' };

    // Apply filters
    if (type) where.type = type;
    if (semester) where.semester = parseInt(semester);
    if (university) where.university = university;
    if (subjectCode) where.subjectCode = subjectCode.toUpperCase();

    // Text search (search in title, subjectName, subjectCode, tags)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subjectName: { contains: search, mode: 'insensitive' } },
        { subjectCode: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Determine sort order
    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'downloads') orderBy = { downloads: 'desc' };
    else if (sortBy === 'views') orderBy = { views: 'desc' };
    else if (sortBy === 'upvotes') orderBy = { upvotes: 'desc' };

    // Pagination bounds
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const total = await prisma.studyMaterial.count({ where });
    const rawMaterials = await prisma.studyMaterial.findMany({
      where,
      include: {
        uploadedBy: {
          select: { id: true, name: true, avatar: true, college: true, reputation: true }
        }
      },
      orderBy,
      skip,
      take
    });

    // Format tags back into arrays
    const materials = rawMaterials.map(m => ({
      ...m,
      tags: m.tags ? m.tags.split(',') : []
    }));

    res.status(200).json({
      success: true,
      count: materials.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / take)
      },
      materials
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single material by ID
// @route   GET /api/materials/:id
// @access  Public
exports.getMaterial = async (req, res, next) => {
  try {
    const rawMaterial = await prisma.studyMaterial.findUnique({
      where: { id: req.params.id },
      include: {
        uploadedBy: {
          select: { id: true, name: true, avatar: true, college: true, reputation: true, totalUploads: true, createdAt: true }
        },
        approvedBy: {
          select: { name: true }
        },
        upvotedBy: { select: { id: true } },
        downvotedBy: { select: { id: true } }
      }
    });

    if (!rawMaterial) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    // Increment views (non-blocking)
    await prisma.studyMaterial.update({
      where: { id: rawMaterial.id },
      data: { views: { increment: 1 } }
    });

    try {
      await prisma.activityLog.create({
        data: {
          action: 'view',
          targetId: rawMaterial.id,
          targetType: rawMaterial.type,
          details: JSON.stringify({ title: rawMaterial.title })
        }
      });
    } catch (err) {}

    // Format tags
    const material = {
      ...rawMaterial,
      tags: rawMaterial.tags ? rawMaterial.tags.split(',') : [],
      upvotedBy: rawMaterial.upvotedBy.map(u => u.id),
      downvotedBy: rawMaterial.downvotedBy.map(u => u.id)
    };

    res.status(200).json({
      success: true,
      material
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload new study material
// @route   POST /api/materials
// @access  Protected
exports.uploadMaterial = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a PDF file' });
    }

    const { title, type, subjectCode, subjectName, semester, university, year, description, tags } = req.body;

    const uploadResult = await uploadFile(req.file);

    // Save comma-separated tags
    let tagString = '';
    if (tags) {
      tagString = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0).join(',');
    }

    const material = await prisma.studyMaterial.create({
      data: {
        title,
        type,
        subjectCode: subjectCode.toUpperCase(),
        subjectName,
        semester: parseInt(semester),
        university,
        year: year ? parseInt(year) : null,
        description,
        tags: tagString,
        fileUrl: uploadResult.fileUrl,
        filePublicId: uploadResult.filePublicId,
        fileSize: uploadResult.fileSize,
        uploadedById: req.user.id,
        status: process.env.NODE_ENV === 'development' ? 'approved' : 'pending',
        approvedAt: process.env.NODE_ENV === 'development' ? new Date() : null
      }
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'upload',
        targetId: material.id,
        targetType: type,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    res.status(201).json({
      success: true,
      message: 'Material uploaded successfully and is currently under review.',
      material
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update material details
// @route   PUT /api/materials/:id
// @access  Protected (Owner/Admin)
exports.updateMaterial = async (req, res, next) => {
  try {
    const material = await prisma.studyMaterial.findUnique({
      where: { id: req.params.id }
    });

    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    // Check ownership or admin status
    if (material.uploadedById !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this material' });
    }

    const { title, subjectCode, subjectName, semester, university, year, description, tags } = req.body;

    const dataToUpdate = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (subjectCode !== undefined) dataToUpdate.subjectCode = subjectCode.toUpperCase();
    if (subjectName !== undefined) dataToUpdate.subjectName = subjectName;
    if (semester !== undefined) dataToUpdate.semester = parseInt(semester);
    if (university !== undefined) dataToUpdate.university = university;
    if (year !== undefined) dataToUpdate.year = year ? parseInt(year) : null;
    if (description !== undefined) dataToUpdate.description = description;
    
    if (tags !== undefined) {
      dataToUpdate.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0).join(',');
    }

    // If edited by a user, reset status to pending for moderation (unless in development)
    if (req.user.role === 'user') {
      dataToUpdate.status = process.env.NODE_ENV === 'development' ? 'approved' : 'pending';
    }

    const updated = await prisma.studyMaterial.update({
      where: { id: material.id },
      data: dataToUpdate
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'edit',
        targetId: material.id,
        targetType: material.type,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    res.status(200).json({
      success: true,
      message: 'Material updated successfully.',
      material: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Protected (Owner/Admin)
exports.deleteMaterial = async (req, res, next) => {
  try {
    const material = await prisma.studyMaterial.findUnique({
      where: { id: req.params.id }
    });

    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    if (material.uploadedById !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this material' });
    }

    await deleteFile(material.filePublicId);

    // Decrement uploader's totalUploads (if approved)
    if (material.status === 'approved') {
      await prisma.user.update({
        where: { id: material.uploadedById },
        data: { totalUploads: { decrement: 1 } }
      });
    }

    await prisma.studyMaterial.delete({
      where: { id: material.id }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'delete',
        targetId: material.id,
        targetType: material.type,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    res.status(200).json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download material / Increment download count
// @route   POST /api/materials/:id/download
// @access  Protected
exports.downloadMaterial = async (req, res, next) => {
  try {
    const material = await prisma.studyMaterial.findUnique({
      where: { id: req.params.id }
    });

    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    const updatedMaterial = await prisma.studyMaterial.update({
      where: { id: material.id },
      data: { downloads: { increment: 1 } }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'download',
        targetId: material.id,
        targetType: material.type,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    // Increment downloads count for current user
    await prisma.user.update({
      where: { id: req.user.id },
      data: { totalDownloads: { increment: 1 } }
    });

    // Update uploader reputation & metrics
    if (material.uploadedById !== req.user.id) {
      await prisma.user.update({
        where: { id: material.uploadedById },
        data: { reputation: { increment: 2 } }
      });

      // Check milestones
      const milestones = [10, 50, 100, 250, 500];
      if (milestones.includes(updatedMaterial.downloads)) {
        await createNotification({
          user: material.uploadedById,
          type: 'milestone',
          title: 'Download Milestone Reached! 🎉',
          message: `Your material "${material.title}" has been downloaded ${updatedMaterial.downloads} times!`,
          link: `/materials/${material.id}`,
          metadata: { material: updatedMaterial, downloads: updatedMaterial.downloads }
        });
      } else {
        await createNotification({
          user: material.uploadedById,
          type: 'download',
          title: 'Document Downloaded 📥',
          message: `Someone downloaded your file "${material.title}".`,
          link: `/materials/${material.id}`
        });
      }
    }

    res.status(200).json({
      success: true,
      downloads: updatedMaterial.downloads
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate (upvote/downvote) material
// @route   POST /api/materials/:id/rate
// @access  Protected
exports.rateMaterial = async (req, res, next) => {
  try {
    const { direction } = req.body; // 'up', 'down', 'none'
    const userId = req.user.id;

    if (!['up', 'down', 'none'].includes(direction)) {
      return res.status(400).json({ success: false, error: 'Rating must be up, down, or none' });
    }

    const material = await prisma.studyMaterial.findUnique({
      where: { id: req.params.id },
      include: {
        upvotedBy: { select: { id: true } },
        downvotedBy: { select: { id: true } }
      }
    });

    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    const hasUpvoted = material.upvotedBy.some(u => u.id === userId);
    const hasDownvoted = material.downvotedBy.some(u => u.id === userId);

    let reputationDelta = 0;

    // Disconnect old votes
    const disconnects = {};
    if (hasUpvoted) {
      disconnects.upvotedBy = { disconnect: { id: userId } };
      reputationDelta -= 5;
    }
    if (hasDownvoted) {
      disconnects.downvotedBy = { disconnect: { id: userId } };
      reputationDelta += 2;
    }

    // Apply disconnects first
    if (Object.keys(disconnects).length > 0) {
      await prisma.studyMaterial.update({
        where: { id: material.id },
        data: disconnects
      });
    }

    // Connect new vote
    const connects = {};
    if (direction === 'up') {
      connects.upvotedBy = { connect: { id: userId } };
      reputationDelta += 5;
    } else if (direction === 'down') {
      connects.downvotedBy = { connect: { id: userId } };
      reputationDelta -= 2;
    }

    // Save connects and update totals
    if (Object.keys(connects).length > 0) {
      await prisma.studyMaterial.update({
        where: { id: material.id },
        data: connects
      });
    }

    // Fetch new upvotes/downvotes length
    const finalMaterial = await prisma.studyMaterial.findUnique({
      where: { id: material.id },
      include: {
        _count: {
          select: { upvotedBy: true, downvotedBy: true }
        }
      }
    });

    // Update numbers
    const updated = await prisma.studyMaterial.update({
      where: { id: material.id },
      data: {
        upvotes: finalMaterial._count.upvotedBy,
        downvotes: finalMaterial._count.downvotedBy
      }
    });

    // Update uploader reputation
    if (material.uploadedById !== userId && reputationDelta !== 0) {
      await updateUserReputation(material.uploadedById, reputationDelta);

      if (direction === 'up') {
        await createNotification({
          user: material.uploadedById,
          type: 'comment',
          title: 'New Upvote! 👍',
          message: `${req.user.name} upvoted your material "${material.title}".`,
          link: `/materials/${material.id}`
        });
      }
    }

    // Log Activity
    try {
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'upvote',
          targetId: material.id,
          targetType: material.type,
          details: JSON.stringify({ direction })
        }
      });
    } catch (err) {}

    res.status(200).json({
      success: true,
      upvotes: updated.upvotes,
      downvotes: updated.downvotes,
      userVote: direction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's uploaded materials
// @route   GET /api/materials/user/me
// @access  Protected
exports.getMyMaterials = async (req, res, next) => {
  try {
    const rawMaterials = await prisma.studyMaterial.findMany({
      where: { uploadedById: req.user.id },
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

// @desc    Get materials by subject code
// @route   GET /api/materials/subject/:code
// @access  Public
exports.getMaterialsBySubject = async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase();
    const rawMaterials = await prisma.studyMaterial.findMany({
      where: { subjectCode: code, status: 'approved' },
      orderBy: { downloads: 'desc' }
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

// @desc    Get featured materials
// @route   GET /api/materials/featured
// @access  Public
exports.getFeaturedMaterials = async (req, res, next) => {
  try {
    const rawMaterials = await prisma.studyMaterial.findMany({
      where: { status: 'approved', isFeatured: true },
      include: {
        uploadedBy: {
          select: { id: true, name: true, avatar: true, reputation: true, college: true }
        }
      },
      take: 6
    });

    const materials = rawMaterials.map(m => ({
      ...m,
      tags: m.tags ? m.tags.split(',') : []
    }));

    res.status(200).json({
      success: true,
      materials
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular materials
// @route   GET /api/materials/popular
// @access  Public
exports.getPopularMaterials = async (req, res, next) => {
  try {
    const rawMaterials = await prisma.studyMaterial.findMany({
      where: { status: 'approved' },
      include: {
        uploadedBy: {
          select: { id: true, name: true, avatar: true, reputation: true, college: true }
        }
      },
      orderBy: { downloads: 'desc' },
      take: 6
    });

    const materials = rawMaterials.map(m => ({
      ...m,
      tags: m.tags ? m.tags.split(',') : []
    }));

    res.status(200).json({
      success: true,
      materials
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent materials
// @route   GET /api/materials/recent
// @access  Public
exports.getRecentMaterials = async (req, res, next) => {
  try {
    const rawMaterials = await prisma.studyMaterial.findMany({
      where: { status: 'approved' },
      include: {
        uploadedBy: {
          select: { id: true, name: true, avatar: true, reputation: true, college: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 6
    });

    const materials = rawMaterials.map(m => ({
      ...m,
      tags: m.tags ? m.tags.split(',') : []
    }));

    res.status(200).json({
      success: true,
      materials
    });
  } catch (error) {
    next(error);
  }
};
