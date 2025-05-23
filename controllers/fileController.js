const File = require('../models/File');
const path = require('path');
const fs = require('fs').promises; // Use promises API for async operations
const crypto = require('crypto');

// Ensure the uploads directory exists
const ensureUploadsDirExists = async () => {
    const dir = path.join(__dirname, '..', 'uploads'); // Path relative to this file
    try {
        await fs.access(dir);
    } catch (error) {
        // Directory does not exist, create it
        await fs.mkdir(dir, { recursive: true });
        console.log(`Created uploads directory: ${dir}`);
    }
};
ensureUploadsDirExists(); // Call it once when the controller loads

// @desc    Upload a file
// @route   POST /api/files/upload
// @access  Private
const uploadFile = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
         // File details are available in req.file thanks to multer
        const { originalname, filename: storedFilename, path: filePath, mimetype, size } = req.file;

        const newFile = await File.create({
            filename: originalname,
            storedFilename: storedFilename, // The unique filename generated by multer
            path: filePath, // The path where multer stored the file
            mimetype: mimetype,
            size: size,
            owner: req.user._id, // Get user ID from the authenticated user (via protect middleware)
        });

        res.status(201).json({
            message: 'File uploaded successfully',
            file: {
                _id: newFile._id,
                filename: newFile.filename,
                mimetype: newFile.mimetype,
                size: newFile.size,
                createdAt: newFile.createdAt,
                updatedAt: newFile.updatedAt,
                url: `${req.protocol}://${req.get('host')}/api/files/download/${newFile._id}`,
                downloadCount: newFile.downloadCount || 0,
                shareId: newFile.shareId,
                isPublic: newFile.isPublic || false,
                owner: newFile.owner
            }
        });
    } catch (error) {
        console.error("File Upload Error:", error);
        // If file was saved but DB entry failed, attempt to delete the saved file
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
                console.log(`Cleaned up orphaned file: ${req.file.path}`);
            } catch (cleanupError) {
                console.error(`Error cleaning up orphaned file ${req.file.path}:`, cleanupError);
            }
        }
        next(error);
    }
};

// @desc    Get all files for the logged-in user
// @route   GET /api/files
// @access  Private
const getUserFiles = async (req, res, next) => {
    try {
        const files = await File.find({ owner: req.user._id }).sort({ createdAt: -1 }); // Sort by newest first
        res.json(files.map(file => ({
            _id: file._id,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
            url: `${req.protocol}://${req.get('host')}/api/files/download/${file._id}`,
            downloadCount: file.downloadCount || 0,
            shareId: file.shareId,
            isPublic: file.isPublic || false,
            owner: file.owner
        })));
    } catch (error) {
        console.error("Get User Files Error:", error);
        next(error);
    }
};

// @desc    Get a single file's details (metadata)
// @route   GET /api/files/:id
// @access  Private
const getFileDetails = async (req, res, next) => {
     try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Ensure the user owns the file
        if (file.owner.toString() !== req.user._id.toString()) {
             return res.status(403).json({ message: 'User not authorized to access this file' });
        }

        res.json({ // Send only necessary metadata
            _id: file._id,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            createdAt: file.createdAt,
            // Add share info if implemented
        });
    } catch (error) {
         console.error("Get File Details Error:", error);
         if (error.kind === 'ObjectId') { // Handle invalid MongoDB ID format
             return res.status(404).json({ message: 'File not found (invalid ID format)' });
         }
         next(error);
    }
};


// @desc    Download a file (implementation depends on storage: local or cloud)
// @route   GET /api/files/:id/download
// @access  Private (or potentially public/shared link access)
const downloadFile = async (req, res, next) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Check ownership or if file is shared with the user
        const isOwner = file.owner.toString() === req.user._id.toString();
        const isSharedWithUser = file.sharedWith && file.sharedWith.some(id => id.toString() === req.user._id.toString());
        
        if (!isOwner && !isSharedWithUser) {
            return res.status(403).json({ message: 'User not authorized to download this file' });
        }

        // --- Assuming files stored locally in 'uploads' ---
        // SECURITY NOTE: Ensure 'storedFilename' or 'path' does not allow directory traversal (e.g., '../..')
        // Multer's default filename generation helps, but validation is good practice.
        // Avoid using user-provided 'filename' directly to construct paths.
        const filePath = path.resolve(__dirname, '..', file.path); // Use resolve for absolute path

        // Check if file exists on disk before attempting download
        try {
            await fs.access(filePath);
        } catch (err) {
             console.error(`File not found on disk: ${filePath}`);
             // Optionally: Update DB record to reflect missing file?
             return res.status(404).json({ message: 'File not found on server storage' });
        }

        // Set headers to prompt download
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.filename)}"`); // Use original filename for download
        res.setHeader('Content-Type', file.mimetype);
        res.setHeader('Content-Length', file.size);

        res.download(filePath, file.filename, (err) => {
            if (err) {
                // Handle errors that occur during file streaming
                console.error("File Download Error:", err);
                // Check if headers were already sent
                if (!res.headersSent) {
                     // If headers not sent, maybe the file path issue wasn't caught above
                     // Or some other error occurred before streaming started
                     return res.status(500).json({ message: 'Could not download the file.' });
                }
                // If headers were sent, the error happened mid-stream.
                // The connection might be closed already. Logging is important.
            }
        });
        // --- End Local File Download ---

        // --- If using cloud storage (e.g., S3) ---
        // 1. Get a signed URL from your cloud provider for the file.
        // 2. Redirect the user to that URL:
        //    const downloadUrl = await getSignedUrlFromCloud(file.path); // Implement this function
        //    res.redirect(downloadUrl);
        // --- End Cloud Storage Example ---


    } catch (error) {
        console.error("Download File Error:", error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'File not found (invalid ID format)' });
         }
        next(error);
    }
};


// @desc    Delete a file
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = async (req, res, next) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Ensure the user owns the file
        if (file.owner.toString() !== req.user._id.toString()) {
             return res.status(403).json({ message: 'User not authorized to delete this file' });
        }

        // --- Assuming files stored locally ---
        const filePath = path.resolve(__dirname, '..', file.path);
        try {
             await fs.unlink(filePath); // Delete file from filesystem
             console.log(`Deleted file from disk: ${filePath}`);
        } catch (error) {
            // Log error but proceed to delete DB record anyway, maybe file was already gone
            console.error(`Error deleting file from disk ${filePath}:`, error);
        }

        // Delete the file record from the database
        await File.findByIdAndDelete(req.params.id);

        res.json({ message: 'File deleted successfully', _id: req.params.id });

    } catch (error) {
        console.error("Delete File Error:", error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'File not found (invalid ID format)' });
         }
        next(error);
    }
};

// @desc    Generate a share link for a file
// @route   POST /api/files/:id/share
// @access  Private
const generateShareLink = async (req, res, next) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Ensure the user owns the file
        if (file.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to share this file' });
        }

        // Generate a unique share ID if it doesn't exist
        if (!file.shareId) {
            file.shareId = crypto.randomBytes(16).toString('hex');
            file.isPublic = true;
            await file.save();
        }

        // Use the frontend URL for the share link
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
        const shareLink = `${frontendUrl}/share/${file.shareId}`;

        res.json({
            message: 'Share link generated successfully',
            shareLink,
            shareId: file.shareId
        });
    } catch (error) {
        console.error("Generate Share Link Error:", error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'File not found (invalid ID format)' });
        }
        next(error);
    }
};

// @desc    Get a shared file
// @route   GET /api/files/shared/:shareId
// @access  Public
const getSharedFile = async (req, res, next) => {
    try {
        const file = await File.findOne({ shareId: req.params.shareId });

        if (!file) {
            return res.status(404).json({ message: 'File not found or sharing link is invalid' });
        }

        if (!file.isPublic) {
            return res.status(403).json({ message: 'This file is no longer shared' });
        }

        // Return file details
        res.json({
            _id: file._id,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            createdAt: file.createdAt,
            downloadCount: file.downloadCount,
            isPublic: file.isPublic,
            shareId: file.shareId
        });
    } catch (error) {
        console.error("Get Shared File Error:", error);
        next(error);
    }
};

// @desc    Download a shared file
// @route   GET /api/files/shared/:shareId/download
// @access  Public
const downloadSharedFile = async (req, res, next) => {
    try {
        const file = await File.findOne({ shareId: req.params.shareId });

        if (!file) {
            return res.status(404).json({ message: 'File not found or sharing link is invalid' });
        }

        if (!file.isPublic) {
            return res.status(403).json({ message: 'This file is no longer shared' });
        }

        const filePath = path.resolve(__dirname, '..', file.path);

        // Check if file exists on disk
        try {
            await fs.access(filePath);
        } catch (err) {
            console.error(`File not found on disk: ${filePath}`);
            return res.status(404).json({ message: 'File not found on server storage' });
        }

        // Increment download count
        file.downloadCount = (file.downloadCount || 0) + 1;
        await file.save();

        // Set headers for download
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.filename)}"`);
        res.setHeader('Content-Type', file.mimetype);
        res.setHeader('Content-Length', file.size);

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('error', (err) => {
            console.error("File Stream Error:", err);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Error streaming file' });
            }
        });

    } catch (error) {
        console.error("Download Shared File Error:", error);
        next(error);
    }
};

// @desc    Upload a temporary file (no auth required)
// @route   POST /api/files/temp-upload
// @access  Public
const uploadTempFile = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const { originalname, filename: storedFilename, path: filePath, mimetype, size } = req.file;
        
        // Generate a temporary ID for the file
        const tempId = crypto.randomBytes(8).toString('hex');
        
        // Create a temporary file record in the database
        const tempFile = await File.create({
            filename: originalname,
            storedFilename: storedFilename,
            path: filePath,
            mimetype: mimetype,
            size: size,
            tempId: tempId,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            isTemporary: true
        });

        // Generate the temporary access link using the frontend URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
        const tempLink = `${frontendUrl}/temp/${tempId}`;

        res.status(201).json({
            message: 'File uploaded successfully',
            tempLink: tempLink,
            expiresAt: tempFile.expiresAt,
        });
    } catch (error) {
        console.error("Temp File Upload Error:", error);
        // If file was saved but DB entry failed, attempt to delete the saved file
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
                console.log(`Cleaned up orphaned file: ${req.file.path}`);
            } catch (cleanupError) {
                console.error(`Error cleaning up orphaned file ${req.file.path}:`, cleanupError);
            }
        }
        next(error);
    }
};

const getTempFile = async (req, res, next) => {
    try {
        const file = await File.findOne({ tempId: req.params.id, isTemporary: true });

        if (!file) {
            return res.status(404).json({ message: 'Temporary file not found' });
        }

        // Check if the file has expired
        if (file.expiresAt && new Date() > file.expiresAt) {
            // Delete the expired file
            await fs.unlink(file.path);
            await File.findByIdAndDelete(file._id);
            return res.status(404).json({ message: 'Temporary file has expired' });
        }

        res.json({
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            expiresAt: file.expiresAt,
        });
    } catch (error) {
        console.error("Get Temp File Error:", error);
        next(error);
    }
};

const downloadTempFile = async (req, res, next) => {
    try {
        const file = await File.findOne({ tempId: req.params.id, isTemporary: true });

        if (!file) {
            return res.status(404).json({ message: 'Temporary file not found' });
        }

        // Check if the file has expired
        if (file.expiresAt && new Date() > file.expiresAt) {
            // Delete the expired file
            await fs.unlink(file.path);
            await File.findByIdAndDelete(file._id);
            return res.status(404).json({ message: 'Temporary file has expired' });
        }

        // Check if file exists on disk
        try {
            await fs.access(file.path);
        } catch (err) {
            console.error(`File not found on disk: ${file.path}`);
            return res.status(404).json({ message: 'File not found on server storage' });
        }

        // Set headers to prompt download
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.filename)}"`);
        res.setHeader('Content-Type', file.mimetype);
        res.setHeader('Content-Length', file.size);

        res.download(file.path, file.filename, (err) => {
            if (err) {
                console.error("Temp File Download Error:", err);
                if (!res.headersSent) {
                    return res.status(500).json({ message: 'Could not download the file.' });
                }
            }
        });
    } catch (error) {
        console.error("Download Temp File Error:", error);
        next(error);
    }
};

// @desc    Share file with specific users
// @route   POST /api/files/:id/share-with-users
// @access  Private
const shareFileWithUsers = async (req, res, next) => {
    try {
        const { userIds } = req.body;
        
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: 'User IDs are required' });
        }

        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Ensure the user owns the file
        if (file.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to share this file' });
        }

        // Add users to the sharedWith array if they're not already there
        const uniqueUserIds = [...new Set([...file.sharedWith.map(id => id.toString()), ...userIds])];
        file.sharedWith = uniqueUserIds;
        
        await file.save();

        res.json({
            message: 'File shared with users successfully',
            sharedWith: file.sharedWith
        });
    } catch (error) {
        console.error("Share File With Users Error:", error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'File or user not found (invalid ID format)' });
        }
        next(error);
    }
};

// @desc    Get files shared with the current user
// @route   GET /api/files/shared-with-me
// @access  Private
const getFilesSharedWithMe = async (req, res, next) => {
    try {
        const files = await File.find({ 
            sharedWith: req.user._id 
        }).populate('owner', 'name email');
        
        res.json(files.map(file => ({
            _id: file._id,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
            url: `${req.protocol}://${req.get('host')}/api/files/${file._id}/download`,
            downloadCount: file.downloadCount || 0,
            owner: file.owner,
            isShared: true
        })));
    } catch (error) {
        console.error("Get Shared Files Error:", error);
        next(error);
    }
};

module.exports = {
    uploadFile,
    getUserFiles,
    getFileDetails,
    downloadFile,
    deleteFile,
    generateShareLink,
    getSharedFile,
    downloadSharedFile,
    uploadTempFile,
    getTempFile,
    downloadTempFile,
    shareFileWithUsers,
    getFilesSharedWithMe
};
