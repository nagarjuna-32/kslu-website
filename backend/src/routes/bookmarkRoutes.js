const express = require('express');
const router = express.Router();
const { getBookmarks, addBookmark, deleteBookmark } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getBookmarks);
router.post('/', addBookmark);
router.delete('/:id', deleteBookmark);

module.exports = router;
