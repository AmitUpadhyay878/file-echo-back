const mongoose = require('mongoose');

const tempFileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    storedFilename: {
        type: String,
        required: true,
        unique: true
    },
    path: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true,
        max: 104857600 // 100MB in bytes
    },
    deviceToken: {
        type: String,
        required: true,
        index: true // Add index for better query performance
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    shareToken: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true // Add index for better query performance
    }
}, {
    timestamps: true
});

// Create a TTL index that will automatically remove documents after they expire
tempFileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TempFile', tempFileSchema);
