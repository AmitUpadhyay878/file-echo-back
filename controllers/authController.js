const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by the pre-save hook in the model
    });

    if (user) {
      // Return user info and token (exclude password)
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error("Registration Error:", error);
    next(error); // Pass error to global error handler
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check for user email
    const user = await User.findOne({ email }).select('+password'); // Need to explicitly select password

    if (user && (await user.matchPassword(password))) {
       res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' }); // Use 401 Unauthorized
    }
  } catch (error) {
     console.error("Login Error:", error);
     next(error);
  }
};

// @desc    Get user profile (get current logged-in user info)
// @route   GET /api/auth/me
// @access  Private (requires token)
const getMe = async (req, res, next) => {
   // req.user is set by the protect middleware
   if (req.user) {
       res.json({
           _id: req.user._id,
           name: req.user.name,
           email: req.user.email,
           // Add any other fields you want to return about the user
       });
   } else {
       // This case should ideally be caught by the protect middleware
       res.status(404).json({ message: 'User not found' });
   }
};


module.exports = {
  registerUser,
  loginUser,
  getMe,
};
