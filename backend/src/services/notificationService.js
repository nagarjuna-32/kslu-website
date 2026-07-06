const { prisma } = require('../config/database');
const { sendRealtimeNotification } = require('../config/socket');
const emailService = require('./emailService');
const logger = require('../utils/logger');

const createNotification = async ({ user, type, title, message, link, metadata }) => {
  try {
    const userDoc = await prisma.user.findUnique({
      where: { id: user }
    });
    if (!userDoc) {
      throw new Error(`User not found: ${user}`);
    }

    let notif = null;

    // 1. Create In-App Notification (database + socket)
    if (userDoc.inAppPref) {
      notif = await prisma.notification.create({
        data: {
          userId: user,
          type,
          title,
          message,
          link,
          metadata: metadata ? JSON.stringify(metadata) : null
        }
      });
      
      // Emit to active socket client
      sendRealtimeNotification(user, notif);
    }

    // 2. Send Email Notification
    if (userDoc.emailPref) {
      let isEmailSent = false;
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

      try {
        switch (type) {
          case 'approval':
            if (metadata && metadata.material) {
              const mId = metadata.material.id || metadata.material._id;
              isEmailSent = await emailService.sendUploadApprovedEmail(
                userDoc,
                metadata.material,
                `${clientUrl}/materials/${mId}`
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
              const mId = metadata.material.id || metadata.material._id;
              isEmailSent = await emailService.sendDownloadMilestoneEmail(
                userDoc,
                metadata.material,
                metadata.downloads || 0,
                `${clientUrl}/materials/${mId}`
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
        await prisma.notification.update({
          where: { id: notif.id },
          data: { isEmailSent: true }
        });
        notif.isEmailSent = true;
      }
    }

    return notif;
  } catch (error) {
    logger.error(`Error in notification creation flow: ${error.message}`);
  }
};

module.exports = { createNotification };
