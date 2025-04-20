const express = require('express');
const { submitContactForm } = require('../controllers/contactController');
// Optional: Import 'protect' and admin check middleware if listing/deleting messages requires auth
// const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Route for submitting the form (Public access)
router.post('/', submitContactForm);

// Optional: Routes for admin actions (would need protection)
// router.get('/', protect, /* optional: isAdmin, */ getAllMessages);
// router.delete('/:id', protect, /* optional: isAdmin, */ deleteMessage);

module.exports = router;
