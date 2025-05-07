import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import upload from '../middleware/upload.js';
// Import routes
import authRoutes from './routes/auth.routes.js';
import galleryRoutes from './routes/gallery.routes.js';
import leaderRoutes from './routes/leader.routes.js';
import announcementRoutes from './routes/announcement.routes.js';
import bookRoutes from './routes/book.routes.js';
import verseRoutes from './routes/verse.routes.js';

// Initialize Express app
const app = express();

// ==============================================
// SECURITY CONFIGURATION
// ==============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://*.mongodb.com"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.disable('x-powered-by');
app.use(cors({
  origin: process.env.FRONTEND_URLS ? 
    process.env.FRONTEND_URLS.split(',') : 
    'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json({ limit: '10mb' }));

// ==============================================
// FILE UPLOAD CONFIGURATION
// ==============================================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`)
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==============================================
// ROUTES
// ==============================================
app.use(express.json()); // Before routes
app.use(cors()); // Before routes

app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/leaders', leaderRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/verses', verseRoutes);

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      message: 'No file uploaded' 
    });
  }
  res.status(201).json({ 
    success: true,
    message: 'File uploaded successfully',
    fileUrl: `/uploads/${req.file.filename}`,
    fileName: req.file.originalname
  });
});

// ==============================================
// PRODUCTION CONFIGURATION
// ==============================================
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// ==============================================
// ERROR HANDLING
// ==============================================
// Add this right before app.use(errorHandler)
app.get('/api/test', (req, res) => {
  res.json({ status: "Backend is working!", time: new Date() });
});

app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack);
  res.status(500).json({ 
    success: false,
    error: process.env.NODE_ENV === 'development' ? 
      err.message : 'Internal Server Error'
  });
});

// ==============================================
// MONGODB ATLAS CONNECTION (ENHANCED)
// ==============================================
const connectToDatabase = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('[DB ERROR] MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 50,
      w: 'majority',
      retryWrites: true,
      appName: 'Campus-Church-App'
    });

    console.log('✅ [MONGODB] Successfully connected to Atlas cluster');
    
    mongoose.connection.on('connected', () => {
      console.log('🔄 [MONGODB] Connection re-established');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ [MONGODB] Connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ [MONGODB] Connection lost');
    });

    // Start server only after successful DB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 [SERVER] Running on port ${PORT}`);
      console.log(`🌐 [FRONTEND] Access at ${process.env.FRONTEND_URLS || 'http://localhost:8080'}`);
    });

  } catch (err) {
    console.error('❌ [MONGODB] Connection failed:', {
      error: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    process.exit(1);
  }
};

// Initialize connection
connectToDatabase();