const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const {
    uploadTempFile,
    downloadTempFile,
    getTempFileInfo,
    getDeviceUploadCount
} = require('../controllers/tempFileController');

const router = express.Router();

// Multer setup for temporary files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads/temp'));
    },
    filename: (req, file, cb) => {
        const randomName = crypto.randomBytes(16).toString('hex');
        cb(null, `${randomName}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 104857600 }, // 100MB limit
});

// Routes
router.post('/upload', upload.single('file'), uploadTempFile);
router.get('/download/:shareToken', downloadTempFile);
router.get('/info/:shareToken', getTempFileInfo);
router.get('/device-count/:deviceToken', getDeviceUploadCount);

module.exports = router;
