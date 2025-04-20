const TempFile = require('../models/TempFile');
const DeviceUpload = require('../models/DeviceUpload');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

// Generate a random token
const generateToken = () => crypto.randomBytes(32).toString('hex');

// Check device upload limit
const checkDeviceUploadLimit = async (deviceToken) => {
    let deviceUpload = await DeviceUpload.findOne({ deviceToken });
    
    if (!deviceUpload) {
        deviceUpload = await DeviceUpload.create({
            deviceToken,
            uploadCount: 0
        });
    }

    if (deviceUpload.uploadCount >= 5) {
        throw new Error('Upload limit reached for this device');
    }

    return deviceUpload;
};

// Upload temporary file
const uploadTempFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Check file size (100MB limit)
        if (req.file.size > 104857600) {
            await fs.unlink(req.file.path); // Delete the uploaded file
            return res.status(400).json({ message: 'File size exceeds 100MB limit' });
        }

        const deviceToken = req.headers['device-token'] || generateToken();

        // Check upload limit for device
        const deviceUpload = await checkDeviceUploadLimit(deviceToken);

        // Generate share token
        const shareToken = generateToken();

        // Set expiration date (7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const tempFile = await TempFile.create({
            filename: req.file.originalname,
            storedFilename: req.file.filename,
            path: req.file.path,
            mimetype: req.file.mimetype,
            size: req.file.size,
            deviceToken,
            shareToken,
            expiresAt
        });

        // Increment upload count for device
        await DeviceUpload.updateOne(
            { deviceToken },
            { 
                $inc: { uploadCount: 1 },
                lastUploadAt: new Date()
            }
        );

        res.status(201).json({
            message: 'File uploaded successfully',
            deviceToken, // Return device token for future uploads
            fileInfo: {
                shareUrl: `${req.protocol}://${req.get('host')}/api/temp/download/${shareToken}`,
                filename: tempFile.filename,
                size: tempFile.size,
                expiresAt: tempFile.expiresAt
            }
        });

    } catch (error) {
        if (req.file) {
            await fs.unlink(req.file.path).catch(console.error);
        }
        next(error);
    }
};

// Download temporary file
const downloadTempFile = async (req, res, next) => {
    try {
        const { shareToken } = req.params;

        const file = await TempFile.findOne({ shareToken });

        if (!file) {
            return res.status(404).json({ message: 'File not found or has expired' });
        }

        // Update download count
        file.downloadCount += 1;
        await file.save();

        // Set headers for download
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.filename)}"`);
        res.setHeader('Content-Type', file.mimetype);

        // Stream the file
        const fileStream = fs.createReadStream(file.path);
        fileStream.pipe(res);

    } catch (error) {
        next(error);
    }
};

// Get file info
const getTempFileInfo = async (req, res, next) => {
    try {
        const { shareToken } = req.params;

        const file = await TempFile.findOne({ shareToken });

        if (!file) {
            return res.status(404).json({ message: 'File not found or has expired' });
        }

        res.json({
            filename: file.filename,
            size: file.size,
            downloadCount: file.downloadCount,
            expiresAt: file.expiresAt,
            uploadedAt: file.createdAt
        });

    } catch (error) {
        next(error);
    }
};

// Get device upload count
const getDeviceUploadCount = async (req, res, next) => {
    try {
        const { deviceToken } = req.params;

        const deviceUpload = await DeviceUpload.findOne({ deviceToken });

        if (!deviceUpload) {
            return res.json({ uploadCount: 0 });
        }

        res.json({
            uploadCount: deviceUpload.uploadCount,
            lastUploadAt: deviceUpload.lastUploadAt
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadTempFile,
    downloadTempFile,
    getTempFileInfo,
    getDeviceUploadCount
};
