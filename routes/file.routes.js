const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    uploadFile,
    getUserFiles,
    getFileDetails,
    downloadFile,
    deleteFile,
    generateShareLink,
    getSharedFile,
    downloadSharedFile,
} = require('../controllers/fileController');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Protected routes (require authentication)
router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/', protect, getUserFiles);
router.get('/:id', protect, getFileDetails);
router.get('/:id/download', protect, downloadFile);
router.delete('/:id', protect, deleteFile);
router.post('/:id/share', protect, generateShareLink);

// Public routes (no authentication required)
router.get('/shared/:shareId', getSharedFile);
router.get('/shared/:shareId/download', downloadSharedFile);

module.exports = router; 