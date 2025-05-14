import express from 'express';
import multer from 'multer';
import Book from '../models/Book.js';
import auth from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const router = express.Router();

const fileUpload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: books
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch books',
      error: error.message 
    });
  }
});

// Get single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch book',
      error: error.message
    });
  }
});

// File upload
router.post('/upload-file', auth, fileUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded or invalid file type' 
      });
    }
    
    res.json({
      success: true,
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      fileType: req.file.mimetype.split('/')[1]
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message || 'Upload failed' 
    });
  }
});

// Create book
router.post('/', auth, async (req, res) => {
  try {
    const { title, author, description, fileUrl, coverImage, category } = req.body;
    
    if (!title || !author || !fileUrl || !coverImage) {
      return res.status(400).json({ 
        success: false,
        message: 'Title, author, file and cover image are required' 
      });
    }

    const newBook = new Book({
      title,
      author,
      description: description || '',
      fileUrl,
      coverImage,
      category: category || 'uncategorized' // Default category
    });

    await newBook.save();
    res.status(201).json({
      success: true,
      data: newBook
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
});

// Update book
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, author, description, fileUrl, coverImage } = req.body;
    
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, description, fileUrl, coverImage },
      { new: true, runValidators: true }
    );

    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      data: updatedBook
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
});

// Delete book
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    [book.fileUrl, book.coverImage].forEach(url => {
      if (url) {
        const filePath = path.join(uploadsDir, url.replace('/uploads/', ''));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    });

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

export default router;