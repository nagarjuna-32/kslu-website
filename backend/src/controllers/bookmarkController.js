const { prisma } = require('../config/database');

// @desc    Get user bookmarks
// @route   GET /api/bookmarks
// @access  Protected
exports.getBookmarks = async (req, res, next) => {
  try {
    const bookmarksData = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      include: {
        material: {
          include: {
            uploadedBy: {
              select: { id: true, name: true, avatar: true, college: true, reputation: true }
            }
          }
        }
      }
    });

    const bookmarks = bookmarksData.map(b => ({
      ...b,
      material: b.material ? {
        ...b.material,
        tags: b.material.tags ? b.material.tags.split(',') : []
      } : null
    }));
      
    res.status(200).json({ 
      success: true, 
      count: bookmarks.length, 
      bookmarks 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a bookmark
// @route   POST /api/bookmarks
// @access  Protected
exports.addBookmark = async (req, res, next) => {
  try {
    const { materialId } = req.body;
    if (!materialId) {
      return res.status(400).json({ success: false, error: 'Please provide materialId' });
    }

    // Check if already bookmarked
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_materialId: {
          userId: req.user.id,
          materialId
        }
      }
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'Material already bookmarked' });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: req.user.id,
        materialId
      }
    });

    res.status(201).json({ 
      success: true, 
      bookmark 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove bookmark
// @route   DELETE /api/bookmarks/:id
// @access  Protected
exports.deleteBookmark = async (req, res, next) => {
  try {
    const id = req.params.id; // Can be Bookmark ID or Material ID

    try {
      // Try to delete via compound key (userId + materialId)
      await prisma.bookmark.delete({
        where: {
          userId_materialId: {
            userId: req.user.id,
            materialId: id
          }
        }
      });
    } catch (err) {
      // Fallback: delete by Bookmark ID
      const bookmark = await prisma.bookmark.findUnique({ where: { id } });
      if (!bookmark || bookmark.userId !== req.user.id) {
        return res.status(404).json({ success: false, error: 'Bookmark not found' });
      }
      
      await prisma.bookmark.delete({
        where: { id }
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Bookmark removed successfully' 
    });
  } catch (error) {
    next(error);
  }
};
