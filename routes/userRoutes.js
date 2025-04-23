const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { query } = req.query;
    
    // Don't return the current user in search results
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user
        {
          $or: [
            { username: { $regex: query || '', $options: 'i' } },
            { email: { $regex: query || '', $options: 'i' } },
            { name: { $regex: query || '', $options: 'i' } }
          ]
        }
      ]
    }).select('_id username email name');
    
    // Add log to debug
    console.log('Found users:', users);
    
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router; 