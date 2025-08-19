const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Public routes
router.get('/api/blogs', blogController.getBlogsForIndex);
router.get('/:slug', blogController.getBlogBySlug);

// Admin routes
router.get('/', blogController.getAllBlogs);

router.get('/create', blogController.showCreateBlogForm);
router.post('/create', blogController.createBlog);
router.get('/:id/edit', blogController.showEditBlogForm);
router.post('/:id/edit', blogController.updateBlog);
router.post('/:id/delete', blogController.deleteBlog);

// New admin routes for enhanced functionality
router.post('/:id/toggle-status', blogController.toggleBlogStatus);
router.post('/bulk-delete', blogController.bulkDeleteBlogs);
router.post('/bulk-update-status', blogController.bulkUpdateStatus);

module.exports = router;