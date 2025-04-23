const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // Needed for serving static files if uploads are served directly
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const contactRoutes = require('./routes/contactRoutes'); // Import contact routes
const blogRoutes = require('./routes/blogRoutes'); // Import blog routes
const { protect } = require('./middleware/authMiddleware'); // Import protect middleware
const jobRoutes = require('./routes/jobRoutes');
const multer = require('multer');
// const { put } = require('@vercel/blob');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();


// Middleware
// Allow requests from your React frontend (adjust origin if needed)
app.use(cors({ origin: ['https://tempszero.vercel.app','http://localhost:8080'], credentials: true })); // Enable credentials for cookies/auth headers
// app.use(cors());
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies (needed for forms potentially)

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

const upload = multer({ 
    storage,
    limits: { fileSize: 1024 * 1024 * 100 } // 100MB limit
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/jobs', jobRoutes); // Mount job routes before file routes
app.use('/api/blogs', blogRoutes); // Mount blog routes

// File routes - split into authenticated and public routes
const publicFileRouter = express.Router();
const protectedFileRouter = express.Router();

// Import file controller functions
const {
  uploadFile,
  getUserFiles,
  getFileDetails,
  downloadFile,
  deleteFile,
  generateShareLink,
  uploadTempFile,
  getTempFile,
  downloadTempFile,
  getSharedFile
} = require('./controllers/fileController');

// Public file routes (no auth required)
publicFileRouter.post('/temp-upload', upload.single('file'), uploadTempFile);
publicFileRouter.get('/temp/:id', getTempFile);
publicFileRouter.get('/temp/:id/download', downloadTempFile);
publicFileRouter.get('/shared/:id', getSharedFile);

// Protected file routes (auth required)
protectedFileRouter.post('/upload', upload.single('file'), uploadFile);
protectedFileRouter.get('/', getUserFiles);
protectedFileRouter.get('/:id', getFileDetails);
protectedFileRouter.get('/:id/download', downloadFile);
protectedFileRouter.delete('/:id', deleteFile);
protectedFileRouter.post('/:id/share', generateShareLink);

// Apply routes
app.use('/api/files', publicFileRouter); // Public routes first
app.use('/api/files', protect, protectedFileRouter); // Protected routes with auth middleware second

// Basic route (optional, can be removed if frontend handles all routing)
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to File Echo API' });
});

// Serve uploaded files (optional, depends on how you store/serve files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.post('/upload', upload.single('file'), async (req, res) => {
//     const { originalname, buffer } = req.file;
//     const blob = await put(originalname, buffer, {
//       access: 'public',
//     });
//     res.json({ url: blob.url });
//   });

// Not Found Handler (should be after all routes)
app.use((req, res, next) => {
    res.status(404).json({ message: 'API route not found' });
});

// Global Error Handler (should be the last piece of middleware)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong!',
        // Optionally include stack trace in development
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
