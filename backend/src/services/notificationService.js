const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendRealtimeNotification } = require('../config/socket');
const emailService = require('./emailService');
const logger = require('../utils/logger');

const createNotification = async ({ user, type, title, message, link, metadata }) => {
  try {
    const userDoc = await User.findById(user);
    if (!userDoc) {
      throw new Error(`User not found: ${user}`);
    }

    let notif = null;

    // 1. Create In-App Notification (database + socket)
    if (userDoc.notificationPreferences.inApp) {
      notif = await Notification.create({
        user,
        type,
        title,
        message,
        link,
        metadata
      });
      
      // Emit to active socket client
      sendRealtimeNotification(user, notif);
    }

    // 2. Send Email Notification
    if (userDoc.notificationPreferences.email) {
      let isEmailSent = false;
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

      try {
        switch (type) {
          case 'approval':
            if (metadata && metadata.material) {
              isEmailSent = await emailService.sendUploadApprovedEmail(
                userDoc,
                metadata.material,
                `${clientUrl}/materials/${metadata.material._id}`
              );
            }
            break;
          case 'rejection':
            if (metadata && metadata.material) {
              isEmailSent = await emailService.sendUploadRejectedEmail(
                userDoc,
                metadata.material,
                metadata.reason || 'Content guidelines not met.',
                `${clientUrl}/profile`
              );
            }
            break;
          case 'milestone':
            if (metadata && metadata.material) {
              isEmailSent = await emailService.sendDownloadMilestoneEmail(
                userDoc,
                metadata.material,
                metadata.downloads || 0,
                `${clientUrl}/materials/${metadata.material._id}`
              );
            }
            break;
          case 'announcement':
            if (metadata && metadata.announcement) {
              isEmailSent = await emailService.sendAnnouncementEmail(
                userDoc,
                metadata.announcement
              );
            }
            break;
          default:
            break;
        }
      } catch (err) {
        logger.error(`Failed to send email trigger in notification service: ${err.message}`);
      }

      if (notif && isEmailSent) {
        notif.isEmailSent = true;
        await notif.save();
      }
    }

    return notif;
  } catch (error) {
    logger.error(`Error in notification creation flow: ${error.message}`);
  }
};

module.exports = { createNotification };
