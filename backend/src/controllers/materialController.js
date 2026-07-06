const StudyMaterial = require('../models/StudyMaterial');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { uploadFile, deleteFile } = require('../services/fileService');
const { createNotification } = require('../services/notificationService');
const logger = require('../utils/logger');

// Helper to update user reputation
const updateUserReputation = async (userId, points) => {
  try {
    await User.findByIdAndUpdate(userId, { $inc: { reputation: points } });
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

    const query = { status: 'approved' };

    // Apply filters
    if (type) query.type = type;
    if (semester) query.semester = parseInt(semester);
    if (university) query.university = university;
    if (subjectCode) query.subjectCode = subjectCode.toUpperCase();

    // Text search (search in title, subjectName, subjectCode, tags)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subjectName: { $regex: search, $options: 'i' } },
        { subjectCode: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Determine sort
    let sortField = { createdAt: -1 }; // default newest
    if (sortBy === 'downloads') sortField = { downloads: -1 };
    else if (sortBy === 'views') sortField = { views: -1 };
    else if (sortBy === 'upvotes') sortField = { upvotes: -1 };

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const total = await StudyMaterial.countDocuments(query);
    const materials = await StudyMaterial.find(query)
      .populate('uploadedBy', 'name avatar college reputation')
      .sort(sortField)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: materials.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
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
    const material = await StudyMaterial.findById(req.params.id)
      .populate('uploadedBy', 'name avatar college reputation totalUploads createdAt')
      .populate('approvedBy', 'name');

    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    // Increment views (don't block response)
    material.views += 1;
    await material.save({ validateBeforeSave: false });

    // Try logging view
    try {
      await ActivityLog.create({
        action: 'view',
        targetId: material._id,
        targetType: material.type,
        details: { title: material.title }
      });
    } catch (err) {
      // ignore log failure
    }

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

    // Process file upload via File Service
    const uploadResult = await uploadFile(req.file);

    // Parse tags (comma separated)
    let tagList = [];
    if (tags) {
      tagList = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    const material = await StudyMaterial.create({
      title,
      type,
      subjectCode: subjectCode.toUpperCase(),
      subjectName,
      semester: parseInt(semester),
      university,
      year: year ? parseInt(year) : undefined,
      description,
      tags: tagList,
      fileUrl: uploadResult.fileUrl,
      filePublicId: uploadResult.filePublicId,
      fileSize: uploadResult.fileSize,
      uploadedBy: req.user._id
    });

    // Log Activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'upload',
      targetId: material._id,
      targetType: type,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // We do not award reputation points yet. Reputation points are awarded upon Admin Approval.
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
    let material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    // Check ownership or admin status
    if (material.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this material' });
    }

    const { title, subjectCode, subjectName, semester, university, year, description, tags } = req.body;

    if (title) material.title = title;
    if (subjectCode) material.subjectCode = subjectCode.toUpperCase();
    if (subjectName) material.subjectName = subjectName;
    if (semester) material.semester = parseInt(semester);
    if (university) material.university = university;
    if (year) material.year = parseInt(year);
    if (description !== undefined) material.description = description;
    
    if (tags) {
      material.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    // If edited, reset status to pending for moderation
    if (req.user.role === 'user') {
      material.status = 'pending';
    }

    material.updatedAt = Date.now();
    await material.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'edit',
      targetId: material._id,
      targetType: material.type,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: 'Material updated successfully.',
      material
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
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    // Check ownership or admin
    if (material.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this material' });
    }

    // Delete file using file service
    await deleteFile(material.filePublicId);

    // Remove from uploads counts
    await User.findByIdAndUpdate(material.uploadedBy, { $inc: { totalUploads: -1 } });

    // Delete from DB
    await StudyMaterial.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      user: req.user._id,
      action: 'delete',
      targetId: material._id,
      targetType: material.type,
      ip: req.ip,
      userAgent: req.headers['user-agent']
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
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    // Increment download counter
    material.downloads += 1;
    await material.save({ validateBeforeSave: false });

    // Log Activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'download',
      targetId: material._id,
      targetType: material.type,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Update downloader downloads metric
    await User.findByIdAndUpdate(req.user.id, { $inc: { totalDownloads: 1 } });

    // Update uploader reputation & metrics (if uploader is not downloader)
    if (material.uploadedBy.toString() !== req.user.id) {
      // Increment uploader's files downloads tally
      await User.findByIdAndUpdate(material.uploadedBy, { $inc: { reputation: 2 } });

      // Check for milestones: 10, 50, 100 downloads
      const milestones = [10, 50, 100, 250, 500];
      if (milestones.includes(material.downloads)) {
        await createNotification({
          user: material.uploadedBy,
          type: 'milestone',
          title: 'Download Milestone Reached! 🎉',
          message: `Your material "${material.title}" has been downloaded ${material.downloads} times!`,
          link: `/materials/${material._id}`,
          metadata: { material, downloads: material.downloads }
        });
      } else {
        // Standard notification for download
        await createNotification({
          user: material.uploadedBy,
          type: 'download',
          title: 'Document Downloaded 📥',
          message: `Someone downloaded your file "${material.title}".`,
          link: `/materials/${material._id}`
        });
      }
    }

    res.status(200).json({
      success: true,
      downloads: material.downloads
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
    const { direction } = req.body; // 'up' or 'down' or 'none' (to undo rating)
    const userId = req.user.id;

    if (!['up', 'down', 'none'].includes(direction)) {
      return res.status(400).json({ success: false, error: 'Rating must be up, down, or none' });
    }

    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    const upvoteIndex = material.upvotedBy.indexOf(userId);
    const downvoteIndex = material.downvotedBy.indexOf(userId);

    let reputationDelta = 0;

    // Reset previous vote
    if (upvoteIndex > -1) {
      material.upvotedBy.splice(upvoteIndex, 1);
      reputationDelta -= 5; // revoke previous upvote reputation from uploader
    }
    if (downvoteIndex > -1) {
      material.downvotedBy.splice(downvoteIndex, 1);
      reputationDelta += 2; // restore previous downvote penalty
    }

    // Apply new vote
    if (direction === 'up') {
      material.upvotedBy.push(userId);
      reputationDelta += 5;
    } else if (direction === 'down') {
      material.downvotedBy.push(userId);
      reputationDelta -= 2;
    }

    material.upvotes = material.upvotedBy.length;
    material.downvotes = material.downvotedBy.length;

    await material.save({ validateBeforeSave: false });

    // Update uploader reputation (if uploader is not voter)
    if (material.uploadedBy.toString() !== userId && reputationDelta !== 0) {
      await updateUserReputation(material.uploadedBy, reputationDelta);

      // Notify uploader on new upvote
      if (direction === 'up') {
        await createNotification({
          user: material.uploadedBy,
          type: 'comment',
          title: 'New Upvote! 👍',
          message: `${req.user.name} upvoted your material "${material.title}".`,
          link: `/materials/${material._id}`
        });
      }
    }

    // Log activity
    try {
      await ActivityLog.create({
        user: userId,
        action: 'upvote',
        targetId: material._id,
        targetType: material.type,
        details: { direction }
      });
    } catch (err) {}

    res.status(200).json({
      success: true,
      upvotes: material.upvotes,
      downvotes: material.downvotes,
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
    const materials = await StudyMaterial.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });
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
    const materials = await StudyMaterial.find({ subjectCode: code, status: 'approved' }).sort({ downloads: -1 });
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
    const materials = await StudyMaterial.find({ status: 'approved', isFeatured: true })
      .populate('uploadedBy', 'name avatar reputation college')
      .limit(6);
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
    const materials = await StudyMaterial.find({ status: 'approved' })
      .populate('uploadedBy', 'name avatar reputation college')
      .sort({ downloads: -1 })
      .limit(6);
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
    const materials = await StudyMaterial.find({ status: 'approved' })
      .populate('uploadedBy', 'name avatar reputation college')
      .sort({ createdAt: -1 })
      .limit(6);
    res.status(200).json({
      success: true,
      materials
    });
  } catch (error) {
    next(error);
  }
};
