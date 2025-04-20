const Contact = require('../models/Contact'); // Import the model

// @desc    Submit a new contact form message
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res, next) => {
  const { name, email, subject, message } = req.body;

  // Basic validation (Mongoose schema validation also applies)
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    // Create a new contact message document
    const newContactMessage = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    // Optionally: Send an email notification to an admin here

    res.status(201).json({
      success: true,
      message: 'Your message has been received. Thank you!',
      data: { // Optionally return the created message ID or confirmation
         id: newContactMessage._id
      }
    });

  } catch (error) {
    console.error("Contact Form Submission Error:", error);
    // Check for Mongoose validation errors
    if (error.name === 'ValidationError') {
         const messages = Object.values(error.errors).map(val => val.message);
         return res.status(400).json({ message: messages.join('. ') });
    }
    next(error); // Pass other errors to the global error handler
  }
};

// Optional: Add functions here later if you need to list or delete messages (e.g., for an admin panel)
// const getAllMessages = async (req, res, next) => { ... }
// const deleteMessage = async (req, res, next) => { ... }

module.exports = {
  submitContactForm,
  // getAllMessages, // Export if you add them
  // deleteMessage,
};
