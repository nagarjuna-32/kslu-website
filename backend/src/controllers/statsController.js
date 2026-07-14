const { prisma } = require('../config/database');

// @desc    Get public statistics for home screen
// @route   GET /api/stats
// @access  Public
exports.getPublicStats = async (req, res, next) => {
  try {
    const totalNotes = await prisma.studyMaterial.count({
      where: { 
        status: 'approved', 
        type: 'note',
        NOT: { subjectCode: 'SYLLABUS' }
      }
    });

    const totalSyllabus = await prisma.studyMaterial.count({
      where: { status: 'approved', subjectCode: 'SYLLABUS' }
    });
    
    const totalPapers = await prisma.studyMaterial.count({
      where: { status: 'approved', type: 'paper' }
    });
    
    const totalUsers = await prisma.user.count();
    
    // Sum downloads using Prisma aggregates
    const downloadStats = await prisma.studyMaterial.aggregate({
      where: { status: 'approved' },
      _sum: { downloads: true }
    });
    const totalDownloads = downloadStats._sum.downloads || 0;

    // Fetch top 5 contributors
    const topContributors = await prisma.user.findMany({
      where: { isBanned: false },
      select: {
        id: true,
        name: true,
        avatar: true,
        reputation: true,
        totalUploads: true
      },
      orderBy: { reputation: 'desc' },
      take: 5
    });

    res.status(200).json({
      success: true,
      stats: {
        totalNotes,
        totalPapers,
        totalSyllabus,
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
    const groups = await prisma.studyMaterial.groupBy({
      by: ['subjectCode', 'subjectName'],
      where: { status: 'approved' },
      _count: { id: true },
      orderBy: {
        _count: { id: 'desc' }
      }
    });

    const subjects = groups.map(g => ({
      code: g.subjectCode,
      name: g.subjectName,
      count: g._count.id
    }));
    
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
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
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
