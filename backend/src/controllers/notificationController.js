const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Protected
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ 
      success: true, 
      count: notifications.length, 
      notifications 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get count of unread notifications
// @route   GET /api/notifications/unread
// @access  Protected
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ user: req.user.id, isRead: false });
    res.status(200).json({ 
      success: true, 
      count 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Protected
exports.markAsRead = async (req, res, next) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    if (notif.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    notif.isRead = true;
    await notif.save();

    res.status(200).json({ 
      success: true, 
      notification: notif 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Protected
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
    res.status(200).json({ 
      success: true, 
      message: 'All notifications marked as read' 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Protected
exports.deleteNotification = async (req, res, next) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    if (notif.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      success: true, 
      message: 'Notification deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
};
