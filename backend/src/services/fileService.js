const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Configure Cloudinary if keys are provided
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  logger.info('Cloudinary storage service initialized.');
} else {
  logger.info('Cloudinary credentials missing. File service running in Local Storage fallback mode.');
}

const uploadFile = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: 'auto',
        folder: 'kslu_circle'
      });
      
      // Remove temporary file uploaded by multer
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        fileUrl: result.secure_url,
        filePublicId: result.public_id,
        fileSize: file.size
      };
    } catch (error) {
      logger.error(`Cloudinary upload failed: ${error.message}`);
      throw error;
    }
  } else {
    // Local fallback: files are already stored in backend/uploads/ by Multer
    const serverUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    return {
      fileUrl: `${serverUrl}/uploads/${file.filename}`,
      filePublicId: file.filename,
      fileSize: file.size
    };
  }
};

const deleteFile = async (publicId) => {
  if (isCloudinaryConfigured) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      logger.error(`Cloudinary deletion failed for ${publicId}: ${error.message}`);
    }
  } else {
    // Local fallback: Delete from uploads directory
    const filePath = path.join(__dirname, '../../uploads', publicId);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        logger.error(`Local file deletion failed: ${error.message}`);
      }
    }
  }
};

module.exports = { uploadFile, deleteFile };
