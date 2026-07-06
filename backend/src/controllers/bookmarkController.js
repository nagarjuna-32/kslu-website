const Bookmark = require('../models/Bookmark');

// @desc    Get user bookmarks
// @route   GET /api/bookmarks
// @access  Protected
exports.getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id })
      .populate({
        path: 'material',
        populate: { path: 'uploadedBy', select: 'name avatar college reputation' }
      });
      
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

    let bookmark = await Bookmark.findOne({ user: req.user.id, material: materialId });
    if (bookmark) {
      return res.status(400).json({ success: false, error: 'Material already bookmarked' });
    }

    bookmark = await Bookmark.create({
      user: req.user.id,
      material: materialId
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
    // Try to find by bookmark ID, or fallback to matching user and material ID
    let bookmark = await Bookmark.findById(req.params.id);
    if (!bookmark) {
      bookmark = await Bookmark.findOne({ user: req.user.id, material: req.params.id });
    }

    if (!bookmark) {
      return res.status(404).json({ success: false, error: 'Bookmark not found' });
    }

    if (bookmark.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to remove this bookmark' });
    }

    await Bookmark.findByIdAndDelete(bookmark._id);

    res.status(200).json({ 
      success: true, 
      message: 'Bookmark removed successfully' 
    });
  } catch (error) {
    next(error);
  }
};
