const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getPopularTags,
  getBlogsByAuthor
} = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getBlogs);
router.get('/tags', getPopularTags);
router.get('/author/:userId', getBlogsByAuthor);
router.get('/:slug', getBlogBySlug);

// Protected routes - require authentication
router.post('/', protect, createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

module.exports = router; 