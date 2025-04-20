const mongoose = require('mongoose');

const deviceUploadSchema = new mongoose.Schema({
    deviceToken: {
        type: String,
        required: true,
        unique: true
    },
    uploadCount: {
        type: Number,
        default: 0
    },
    lastUploadAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DeviceUpload', deviceUploadSchema);
