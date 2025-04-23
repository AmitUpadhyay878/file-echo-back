const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: { // Original filename from the user's computer
    type: String,
    required: true,
  },
  storedFilename: { // The unique name used to store the file on the server/cloud
    type: String,
    required: true,
    unique: true,
  },
  path: { // Path where the file is stored (relative to uploads dir or full cloud URL)
    type: String,
    required: true,
  },
  mimetype: { // File type (e.g., 'image/jpeg', 'application/pdf')
    type: String,
    required: true,
  },
  size: { // File size in bytes
    type: Number,
    required: true,
  },
  owner: { // Reference to the User who uploaded the file
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links this field to the User model
  },
  shareId: { // Unique ID for sharing the file
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
  },
  isPublic: { // Whether the file is publicly accessible
    type: Boolean,
    default: false,
  },
  downloadCount: { // Number of times the file has been downloaded
    type: Number,
    default: 0,
  },
  tempId: { // Unique ID for temporary files
    type: String,
    unique: true,
    sparse: true,
  },
  expiresAt: { // Expiration time for temporary files
    type: Date,
  },
  isTemporary: { // Whether this is a temporary file
    type: Boolean,
    default: false,
  },
  sharedWith: { // Users the file is shared with
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

module.exports = mongoose.model('File', fileSchema);
