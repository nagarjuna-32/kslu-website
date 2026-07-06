const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter;

const isMailConfigured = !!(
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

if (isMailConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  logger.info('Nodemailer SMTP transporter initialized.');
} else {
  logger.info('Nodemailer SMTP settings missing. Emails will be logged to console.');
}

const sendEmail = async ({ to, subject, html }) => {
  const fromEmail = process.env.FROM_EMAIL || 'noreply@kslucircle.com';
  const fromName = process.env.FROM_NAME || 'KSLU Circle';

  if (isMailConfigured) {
    try {
      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html
      };
      await transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      logger.error(`Error sending email to ${to}: ${error.message}`);
      return false;
    }
  } else {
    logger.info(`[MOCK EMAIL SENT]
TO: ${to}
SUBJECT: ${subject}
HTML CONTENT:
----------------------------
${html}
----------------------------`);
    return true;
  }
};

// 1. Welcome Email
const sendWelcomeEmail = async (user, loginLink) => {
  const html = `
    <h2>Welcome to KSLU Circle! 📚</h2>
    <p>Hi ${user.name},</p>
    <p>Welcome to the KSLU Circle community! 🎉</p>
    <p>We're excited to have you on board. KSLU Circle is your go-to platform for:</p>
    <ul>
      <li>📝 Accessing quality notes and question papers</li>
      <li>📄 Sharing your study materials with fellow students</li>
      <li>🏆 Building your reputation and helping others</li>
    </ul>
    <p>To get started, explore our library of study materials, or upload your first note/paper.</p>
    <p><a href="${loginLink}">Start your journey here</a></p>
    <p>Happy studying!<br/>Team KSLU Circle</p>
  `;
  return await sendEmail({ to: user.email, subject: 'Welcome to KSLU Circle! 📚', html });
};

// 2. Email Verification
const sendVerificationEmail = async (user, verificationLink) => {
  const html = `
    <h2>Verify Your Email - KSLU Circle</h2>
    <p>Hi ${user.name},</p>
    <p>Please verify your email address to access all features of KSLU Circle.</p>
    <p><a href="${verificationLink}">Click here to verify email</a></p>
    <p>This link expires in 24 hours.</p>
    <p>If you didn't create an account, you can ignore this email.</p>
    <br/>
    <p>Team KSLU Circle</p>
  `;
  return await sendEmail({ to: user.email, subject: 'Verify Your Email - KSLU Circle', html });
};

// 3. Password Reset
const sendPasswordResetEmail = async (user, resetLink) => {
  const html = `
    <h2>Reset Your Password - KSLU Circle</h2>
    <p>Hi ${user.name},</p>
    <p>We received a request to reset your password.</p>
    <p><a href="${resetLink}">Click here to reset your password</a></p>
    <p>This link expires in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
    <br/>
    <p>Team KSLU Circle</p>
  `;
  return await sendEmail({ to: user.email, subject: 'Reset Your Password - KSLU Circle', html });
};

// 4. Upload Approved
const sendUploadApprovedEmail = async (user, material, materialLink) => {
  const html = `
    <h2>Your Note Has Been Approved! ✅</h2>
    <p>Hi ${user.name},</p>
    <p>Great news! Your "${material.title}" has been approved and is now live on KSLU Circle.</p>
    <h4>📊 Stats:</h4>
    <ul>
      <li>Subject: ${material.subjectCode}</li>
      <li>Semester: ${material.semester}</li>
      <li>Downloads so far: ${material.downloads || 0}</li>
    </ul>
    <p><a href="${materialLink}">View your upload</a></p>
    <p>Keep sharing and helping fellow students! 🙌</p>
    <br/>
    <p>Team KSLU Circle</p>
  `;
  return await sendEmail({ to: user.email, subject: 'Your Note Has Been Approved! ✅', html });
};

// 5. Upload Rejected
const sendUploadRejectedEmail = async (user, material, reason, editLink) => {
  const html = `
    <h2>Update on Your Upload - KSLU Circle</h2>
    <p>Hi ${user.name},</p>
    <p>We've reviewed your "${material.title}" and unfortunately, it couldn't be approved at this time.</p>
    <p><strong>Reason:</strong> ${reason}</p>
    <p>You can edit and resubmit your upload or contact us if you have any questions.</p>
    <p><a href="${editLink}">View and edit material</a></p>
    <p>We appreciate your contribution and encourage you to try again! 💪</p>
    <br/>
    <p>Team KSLU Circle</p>
  `;
  return await sendEmail({ to: user.email, subject: 'Update on Your Upload - KSLU Circle', html });
};

// 6. Download Milestone
const sendDownloadMilestoneEmail = async (user, material, downloads, materialLink, contributorsList = '') => {
  const html = `
    <h2>🎉 Your Note Reached ${downloads} Downloads!</h2>
    <p>Hi ${user.name},</p>
    <p>Congratulations! Your note "${material.title}" has been downloaded ${downloads} times!</p>
    <p>You're making a real difference in your fellow students' lives. Keep up the great work! 🌟</p>
    <p><a href="${materialLink}">View your note</a></p>
    ${contributorsList ? `<p><strong>Top Contributors:</strong></p>${contributorsList}` : ''}
    <br/>
    <p>Team KSLU Circle</p>
  `;
  return await sendEmail({ to: user.email, subject: `🎉 Your Note Reached ${downloads} Downloads!`, html });
};

// 7. Announcement
const sendAnnouncementEmail = async (user, announcement) => {
  const html = `
    <h2>${announcement.title} - KSLU Circle</h2>
    <p>Hi ${user.name},</p>
    <div>${announcement.content}</div>
    ${announcement.link ? `<p><a href="${announcement.link}">Learn more</a></p>` : ''}
    <br/>
    <p>Team KSLU Circle</p>
  `;
  return await sendEmail({ to: user.email, subject: `${announcement.title} - KSLU Circle`, html });
};

module.exports = {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendUploadApprovedEmail,
  sendUploadRejectedEmail,
  sendDownloadMilestoneEmail,
  sendAnnouncementEmail
};
