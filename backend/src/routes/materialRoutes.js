const express = require('express');
const router = express.Router();
const {
  getMaterials,
  getMaterial,
  uploadMaterial,
  updateMaterial,
  deleteMaterial,
  downloadMaterial,
  rateMaterial,
  getMyMaterials,
  getMaterialsBySubject,
  getFeaturedMaterials,
  getPopularMaterials,
  getRecentMaterials
} = require('../controllers/materialController');
const { protect, optionalProtect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateMaterial } = require('../middleware/validation');

// Public endpoints
router.get('/', getMaterials);
router.get('/recent', getRecentMaterials);
router.get('/popular', getPopularMaterials);
router.get('/featured', getFeaturedMaterials);
router.get('/subject/:code', getMaterialsBySubject);

// Current user uploads
router.get('/user/me', protect, getMyMaterials);

// Operations on specific materials
router.get('/:id', getMaterial);
router.post('/', protect, upload.single('file'), validateMaterial, uploadMaterial);
router.put('/:id', protect, updateMaterial);
router.delete('/:id', protect, deleteMaterial);

// Downloads & Ratings
router.post('/:id/download', optionalProtect, downloadMaterial);
router.post('/:id/rate', protect, rateMaterial);

module.exports = router;
