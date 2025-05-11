import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ==============================================
// INITIAL CONFIGURATION
// ==============================================

// Load environment variables from .env file
dotenv.config();

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express application
const app = express();

// ==============================================
// SECURITY MIDDLEWARE
// ==============================================

// Set security-related HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://*.mongodb.com", process.env.FRONTEND_URL || 'http://localhost:8080']
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Disable X-Powered-By header
app.disable('x-powered-by');

// Configure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Parse JSON requests with 10mb limit
app.use(express.json({ limit: '10mb' }));

// ==============================================
// FILE UPLOAD CONFIGURATION
// ==============================================

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==============================================
// ROUTE IMPORTS
// ==============================================

import authRoutes from './routes/auth.routes.js';
import galleryRoutes from './routes/gallery.routes.js';
import leaderRoutes from './routes/leader.routes.js';
import announcementRoutes from './routes/announcement.routes.js';
import bookRoutes from './routes/book.routes.js';
import verseRoutes from './routes/verse.routes.js';
import uploadRoutes from './routes/upload.routes.js';

// ==============================================
// APPLICATION ROUTES
// ==============================================

// Authentication routes
app.use('/api/auth', authRoutes);

// Resource routes
app.use('/api/gallery', galleryRoutes);
app.use('/api/leaders', leaderRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/verses', verseRoutes);

// File upload route
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ==============================================
// PRODUCTION CONFIGURATION
// ==============================================

if (process.env.NODE_ENV === 'production') {
  // Serve static files from React build directory
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// ==============================================
// ERROR HANDLING MIDDLEWARE
// ==============================================

// 404 Not Found handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack);
  
  const statusCode = err.statusCode || 500;
  const errorMessage = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: errorMessage
  });
});

// ==============================================
// DATABASE CONNECTION
// ==============================================

const connectToDatabase = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
 
  if (!MONGODB_URI) {
    console.error('[DB ERROR] MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  try {
    // Configure MongoDB connection options
    const mongooseOptions = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 50,
      w: 'majority',
      retryWrites: true,
      appName: 'Church-App'
    };

    // Establish connection
    await mongoose.connect(MONGODB_URI, mongooseOptions);

    console.log('✅ [MONGODB] Successfully connected to database');

    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('🔄 [MONGODB] Connection re-established');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ [MONGODB] Connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ [MONGODB] Connection lost');
    });

    // Start the server after successful DB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 [SERVER] Running on port ${PORT}`);
      console.log(`🌐 [FRONTEND] Access at ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
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

// Initialize database connection
connectToDatabase();

// Graceful shutdown handler
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('⏏️ [SERVER] Gracefully shutting down');
  process.exit(0);
});