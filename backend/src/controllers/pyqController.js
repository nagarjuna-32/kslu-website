const { prisma } = require('../config/database');
const googleDriveService = require('../services/googleDriveService');
const pyqSyncService = require('../services/pyqSyncService');
const logger = require('../utils/logger');

// ==========================================
// PUBLIC / STUDENT ENDPOINTS
// ==========================================

/**
 * @desc    Get all active courses for PYQ navigation
 * @route   GET /api/pyqs/courses
 * @access  Public
 */
exports.getCourses = async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            pyqs: { where: { isAvailable: true } },
            semesters: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses: courses.map(c => ({
        id: c.id,
        name: c.name,
        code: c.code,
        totalSemesters: c.totalSemesters,
        semesterCount: c._count.semesters,
        pyqCount: c._count.pyqs
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get semesters for a given course
 * @route   GET /api/pyqs/semesters/:courseId
 * @access  Public
 */
exports.getSemesters = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Support either course UUID or course slug (e.g., '3-year-llb')
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { id: courseId },
          { code: courseId.toLowerCase() }
        ]
      }
    });

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    const semesters = await prisma.semester.findMany({
      where: { courseId: course.id },
      include: {
        _count: {
          select: {
            subjects: true,
            pyqs: { where: { isAvailable: true } }
          }
        }
      },
      orderBy: { semesterNumber: 'asc' }
    });

    res.status(200).json({
      success: true,
      course: {
        id: course.id,
        name: course.name,
        code: course.code
      },
      count: semesters.length,
      semesters: semesters.map(s => ({
        id: s.id,
        semesterNumber: s.semesterNumber,
        name: s.name,
        subjectCount: s._count.subjects,
        pyqCount: s._count.pyqs
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get subjects for a given semester
 * @route   GET /api/pyqs/subjects/:semesterId
 * @access  Public
 */
exports.getSubjects = async (req, res, next) => {
  try {
    const { semesterId } = req.params;

    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
      include: { course: true }
    });

    if (!semester) {
      return res.status(404).json({ success: false, error: 'Semester not found' });
    }

    const subjects = await prisma.subject.findMany({
      where: { semesterId },
      include: {
        schemes: {
          select: { id: true, name: true, marks: true }
        },
        _count: {
          select: {
            pyqs: { where: { isAvailable: true } }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      success: true,
      semester: {
        id: semester.id,
        name: semester.name,
        semesterNumber: semester.semesterNumber,
        course: { id: semester.course.id, name: semester.course.name }
      },
      count: subjects.length,
      subjects: subjects.map(s => ({
        id: s.id,
        name: s.name,
        code: s.code,
        schemes: s.schemes,
        pyqCount: s._count.pyqs
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get schemes (80 / 100 Marks) for a subject
 * @route   GET /api/pyqs/schemes/:subjectId
 * @access  Public
 */
exports.getSchemes = async (req, res, next) => {
  try {
    const { subjectId } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        semester: {
          include: { course: true }
        }
      }
    });

    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    const schemes = await prisma.subjectScheme.findMany({
      where: { subjectId },
      include: {
        _count: {
          select: {
            pyqs: { where: { isAvailable: true } }
          }
        }
      },
      orderBy: { marks: 'asc' }
    });

    res.status(200).json({
      success: true,
      subject: {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        semester: subject.semester.name,
        course: subject.semester.course.name
      },
      count: schemes.length,
      schemes: schemes.map(sch => ({
        id: sch.id,
        name: sch.name,
        marks: sch.marks,
        pyqCount: sch._count.pyqs
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List PYQs with filtering, searching, and pagination
 * @route   GET /api/pyqs
 * @access  Public
 */
exports.getPYQs = async (req, res, next) => {
  try {
    const {
      courseId,
      course,
      semesterId,
      semester,
      subjectId,
      schemeId,
      marks,
      year,
      search,
      sortBy = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const where = {};

    // Public / students can ONLY view available question papers
    const isAdmin = req.user && ['admin', 'superadmin'].includes(req.user.role);
    if (!isAdmin || req.query.includeUnavailable !== 'true') {
      where.isAvailable = true;
    }

    // Filter: Course
    if (courseId) {
      where.courseId = courseId;
    } else if (course) {
      where.course = {
        OR: [
          { code: course.toLowerCase() },
          { name: { contains: course, mode: 'insensitive' } }
        ]
      };
    }

    // Filter: Semester
    if (semesterId) {
      where.semesterId = semesterId;
    } else if (semester) {
      const semNum = parseInt(semester, 10);
      if (!isNaN(semNum)) {
        where.semester = { semesterNumber: semNum };
      }
    }

    // Filter: Subject
    if (subjectId) {
      where.subjectId = subjectId;
    }

    // Filter: Scheme / Marks
    if (schemeId) {
      where.schemeId = schemeId;
    } else if (marks) {
      const marksInt = parseInt(marks, 10);
      if (!isNaN(marksInt)) {
        where.scheme = { marks: marksInt };
      }
    }

    // Filter: Year
    if (year) {
      const yearInt = parseInt(year, 10);
      if (!isNaN(yearInt)) {
        where.examYear = yearInt;
      }
    }

    // Search query: in title, fileName, or subject name
    if (search && search.trim()) {
      const s = search.trim();
      where.OR = [
        { title: { contains: s, mode: 'insensitive' } },
        { fileName: { contains: s, mode: 'insensitive' } },
        { subject: { name: { contains: s, mode: 'insensitive' } } },
        { subject: { code: { contains: s, mode: 'insensitive' } } }
      ];
    }

    // Sort order
    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'year_desc') {
      orderBy = { examYear: 'desc' };
    } else if (sortBy === 'year_asc') {
      orderBy = { examYear: 'asc' };
    } else if (sortBy === 'downloads') {
      orderBy = { downloads: 'desc' };
    } else if (sortBy === 'views') {
      orderBy = { views: 'desc' };
    } else if (sortBy === 'title') {
      orderBy = { title: 'asc' };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const total = await prisma.pYQ.count({ where });

    const pyqs = await prisma.pYQ.findMany({
      where,
      include: {
        course: { select: { id: true, name: true, code: true } },
        semester: { select: { id: true, name: true, semesterNumber: true } },
        subject: { select: { id: true, name: true, code: true } },
        scheme: { select: { id: true, name: true, marks: true } }
      },
      orderBy,
      skip,
      take: limitNum
    });

    res.status(200).json({
      success: true,
      count: pyqs.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      },
      pyqs: pyqs.map(p => ({
        id: p.id,
        title: p.title,
        fileName: p.fileName,
        examYear: p.examYear,
        examSession: p.examSession,
        marks: p.scheme?.marks,
        schemeName: p.scheme?.name,
        fileSize: p.fileSize,
        downloads: p.downloads,
        views: p.views,
        isAvailable: p.isAvailable,
        course: p.course,
        semester: p.semester,
        subject: p.subject,
        previewUrl: `/api/pyqs/${p.id}/preview`,
        downloadUrl: `/api/pyqs/${p.id}/download`,
        createdAt: p.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Stream PDF through backend for preview (supports HTTP Range requests)
 * @route   GET /api/pyqs/:id/preview
 * @access  Public (Rate limited)
 */
exports.previewPYQ = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pyq = await prisma.pYQ.findUnique({
      where: { id }
    });

    if (!pyq) {
      return res.status(404).json({ success: false, error: 'Question paper not found' });
    }

    const isAdmin = req.user && ['admin', 'superadmin'].includes(req.user.role);
    if (!pyq.isAvailable && !isAdmin) {
      return res.status(404).json({ success: false, error: 'Question paper is currently unavailable' });
    }

    const rangeHeader = req.headers.range || null;

    try {
      const { stream, metadata, status, headers } = await googleDriveService.streamFile(
        pyq.driveFileId,
        rangeHeader
      );

      // Set PDF response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(pyq.fileName)}"`
      );

      // Pass content range headers if provided by Google Drive
      if (headers['content-range']) {
        res.setHeader('Content-Range', headers['content-range']);
      }
      if (headers['content-length']) {
        res.setHeader('Content-Length', headers['content-length']);
      }

      res.status(status || 200);

      // Pipe PDF stream to client response
      stream.on('error', (streamErr) => {
        logger.error(`Error streaming preview for PYQ ${pyq.id}: ${streamErr.message}`);
        if (!res.headersSent) {
          res.status(502).json({ success: false, error: 'Failed to stream document preview.' });
        }
      });

      stream.pipe(res);

      // Asynchronously increment views counter
      prisma.pYQ.update({
        where: { id: pyq.id },
        data: { views: { increment: 1 } }
      }).catch(err => {
        logger.error(`Failed to increment views on PYQ ${pyq.id}: ${err.message}`);
      });
    } catch (driveErr) {
      logger.error(`Google Drive preview stream error for PYQ ${pyq.id}: ${driveErr.message}`);
      return res.status(502).json({
        success: false,
        error: 'Unable to stream file from Google Drive storage.'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Stream PDF through backend as attachment download
 * @route   GET /api/pyqs/:id/download
 * @access  Public (Rate limited)
 */
exports.downloadPYQ = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pyq = await prisma.pYQ.findUnique({
      where: { id }
    });

    if (!pyq) {
      return res.status(404).json({ success: false, error: 'Question paper not found' });
    }

    const isAdmin = req.user && ['admin', 'superadmin'].includes(req.user.role);
    if (!pyq.isAvailable && !isAdmin) {
      return res.status(404).json({ success: false, error: 'Question paper is currently unavailable' });
    }

    try {
      const { stream, metadata } = await googleDriveService.streamFile(pyq.driveFileId, null);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(pyq.fileName)}"`
      );
      if (metadata.size) {
        res.setHeader('Content-Length', metadata.size);
      }

      res.status(200);

      stream.on('error', (streamErr) => {
        logger.error(`Error streaming download for PYQ ${pyq.id}: ${streamErr.message}`);
        if (!res.headersSent) {
          res.status(502).json({ success: false, error: 'Failed to stream document download.' });
        }
      });

      stream.pipe(res);

      // Increment downloads counter asynchronously
      prisma.pYQ.update({
        where: { id: pyq.id },
        data: { downloads: { increment: 1 } }
      }).catch(err => {
        logger.error(`Failed to increment downloads on PYQ ${pyq.id}: ${err.message}`);
      });

      // If user is authenticated, update user totalDownloads & log activity
      if (req.user) {
        prisma.user.update({
          where: { id: req.user.id },
          data: { totalDownloads: { increment: 1 } }
        }).catch(() => {});

        prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action: 'pyq_download',
            targetId: pyq.id,
            targetType: 'pyq',
            ip: req.ip,
            userAgent: req.headers['user-agent']
          }
        }).catch(() => {});
      }
    } catch (driveErr) {
      logger.error(`Google Drive download stream error for PYQ ${pyq.id}: ${driveErr.message}`);
      return res.status(502).json({
        success: false,
        error: 'Unable to stream file from Google Drive storage.'
      });
    }
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

/**
 * @desc    Trigger Google Drive synchronization
 * @route   POST /api/admin/pyqs/sync
 * @access  Protected (Admin / Superadmin)
 */
exports.syncGoogleDrive = async (req, res, next) => {
  try {
    const { syncType = 'full' } = req.body;
    const userId = req.user ? req.user.id : null;

    if (await pyqSyncService.isRunning()) {
      return res.status(409).json({
        success: false,
        error: 'A synchronization process is already actively running.'
      });
    }

    // Launch synchronization in background to prevent HTTP timeouts
    if (syncType === 'incremental') {
      pyqSyncService.runIncrementalSync(userId).catch(err => {
        logger.error(`Background incremental sync failed: ${err.message}`);
      });
    } else {
      pyqSyncService.runFullSync(userId).catch(err => {
        logger.error(`Background full sync failed: ${err.message}`);
      });
    }

    res.status(202).json({
      success: true,
      message: `Google Drive ${syncType} synchronization initiated successfully in the background.`
    });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({ success: false, error: error.message });
    }
    if (error.statusCode === 400) {
      return res.status(400).json({ success: false, error: error.message });
    }
    next(error);
  }
};

/**
 * @desc    Get Google Drive synchronization status & stats
 * @route   GET /api/admin/pyqs/sync-status
 * @access  Protected (Admin / Superadmin)
 */
exports.getSyncStatus = async (req, res, next) => {
  try {
    const status = await pyqSyncService.getSyncStatus();
    res.status(200).json({
      success: true,
      ...status
    });
  } catch (error) {
    next(error);
  }
};
