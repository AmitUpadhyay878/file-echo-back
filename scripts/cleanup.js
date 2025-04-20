const mongoose = require('mongoose');
const TempFile = require('../models/TempFile');
const fs = require('fs').promises;
const path = require('path');

// This script can be run periodically to clean up expired files that weren't automatically deleted
async function cleanupExpiredFiles() {
    try {
        const expiredFiles = await TempFile.find({
            expiresAt: { $lt: new Date() }
        });

        for (const file of expiredFiles) {
            try {
                // Delete file from filesystem
                await fs.unlink(file.path);
                // Delete database entry
                await TempFile.deleteOne({ _id: file._id });
                console.log(`Cleaned up expired file: ${file.filename}`);
            } catch (error) {
                console.error(`Error cleaning up file ${file.filename}:`, error);
            }
        }
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}

// You can run this script using node scripts/cleanup.js
// Or set it up as a cron job
if (require.main === module) {
    cleanupExpiredFiles()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}
