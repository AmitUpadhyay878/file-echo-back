const express = require('express');
const router = express.Router();
const {
  getJobOpenings,
  getJobOpening,
  createJobOpening,
  updateJobOpening,
  deleteJobOpening,
} = require('../controllers/jobOpeningController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getJobOpenings);
router.get('/:id', getJobOpening);

// Protected admin routes
router.post('/', protect, admin, createJobOpening);
router.put('/:id', protect, admin, updateJobOpening);
router.delete('/:id', protect, admin, deleteJobOpening);

module.exports = router; 