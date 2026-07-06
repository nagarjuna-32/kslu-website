const StudyMaterial = require('../models/StudyMaterial');
const User = require('../models/User');
const Announcement = require('../models/Announcement');

// @desc    Get public statistics for home screen
// @route   GET /api/stats
// @access  Public
exports.getPublicStats = async (req, res, next) => {
  try {
    const totalNotes = await StudyMaterial.countDocuments({ status: 'approved', type: 'note' });
    const totalPapers = await StudyMaterial.countDocuments({ status: 'approved', type: 'paper' });
    const totalUsers = await User.countDocuments();
    
    // Sum downloads across all materials
    const downloadStats = await StudyMaterial.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);
    const totalDownloads = downloadStats.length > 0 ? downloadStats[0].total : 0;

    // Fetch top 5 contributors by reputation
    const topContributors = await User.find({ isBanned: false })
      .select('name avatar reputation college totalUploads')
      .sort({ reputation: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalNotes,
        totalPapers,
        totalUsers,
        totalDownloads
      },
      topContributors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get subject codes with count of materials
// @route   GET /api/subject-codes
// @access  Public
exports.getSubjectCodes = async (req, res, next) => {
  try {
    const subjects = await StudyMaterial.aggregate([
      { $match: { status: 'approved' } },
      { 
        $group: { 
          _id: '$subjectCode', 
          count: { $sum: 1 }, 
          subjectName: { $first: '$subjectName' } 
        } 
      },
      { 
        $project: { 
          _id: 0, 
          code: '$_id', 
          count: 1, 
          name: '$subjectName' 
        } 
      },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({ 
      success: true, 
      subjects 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get supported universities
// @route   GET /api/universities
// @access  Public
exports.getUniversities = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      universities: ['KSLU', 'NLSIU', 'Christ', 'Other']
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently active announcements
// @route   GET /api/announcements/active
// @access  Public
exports.getActiveAnnouncements = async (req, res, next) => {
  try {
    const query = {
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    };
    
    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      announcements 
    });
  } catch (error) {
    next(error);
  }
};
