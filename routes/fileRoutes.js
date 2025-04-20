const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto'); // For generating unique filenames
const {
  uploadFile,
  getUserFiles,
  getFileDetails,
  downloadFile,
  deleteFile,
  getSharedFile,
  uploadTempFile,
  getTempFile,
  downloadTempFile,
} = require('../controllers/fileController');
// Note: The 'protect' middleware is applied in server.js to all routes using this router

const router = express.Router();

// --- Multer Setup ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Files will be saved in the 'uploads/' directory
    cb(null, path.join(__dirname, '..', 'uploads/'));
  },
  filename: function (req, file, cb) {
    // Generate a unique filename to prevent collisions and handle special characters
    // Example: randomBytes-originalFilename.extension
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${randomBytes}-${Date.now()}${fileExtension}`;
    cb(null, uniqueFilename);
  }
});

// Optional: File filter (example: allow only images)
const fileFilter = (req, file, cb) => {
    // You can customize this to allow specific file types
    // Example: Allow common document and image types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        // Reject file
        cb(new Error('Error: File upload only supports the following filetypes - ' + allowedTypes), false);
         // Use cb(new Error(...)) to pass an error to the error handler
         // Use cb(null, false) to silently reject
    }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 50 }, // Limit file size (e.g., 50MB)
  // fileFilter: fileFilter // Uncomment to enable file type filtering
});

// --- Routes ---

// POST /api/files/upload - Use multer middleware for single file upload named 'file'
router.post('/upload', upload.single('file'), uploadFile);

// POST /api/files/temp-upload - Temporary file upload (no auth required)
router.post('/temp-upload', upload.single('file'), uploadTempFile);

// GET /api/files/temp/:id - Get temporary file details (no auth required)
router.get('/temp/:id', getTempFile);

// GET /api/files/temp/:id/download - Download temporary file (no auth required)
router.get('/temp/:id/download', downloadTempFile);

// GET /api/files - Get all files for the user
router.get('/', getUserFiles);

// GET /api/files/:id - Get specific file details
router.get('/:id', getFileDetails);

// GET /api/files/:id/download - Download a specific file
router.get('/:id/download', downloadFile);

// DELETE /api/files/:id - Delete a specific file
router.delete('/:id', deleteFile);

// GET /api/files/shared/:id - Get a shared file (no auth required)
router.get('/shared/:id', getSharedFile);

module.exports = router;
