import express from 'express';
import Book from '../models/Book.js';
import auth from '../middleware/auth.js';
import { uploadBookFiles } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    console.error('Error getting books:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (error) {
    console.error('Error getting book:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create book with file uploads
router.post('/', auth, (req, res, next) => {
  uploadBookFiles(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ 
          success: false,
          message: `Unexpected field: ${err.field}` 
        });
      }
      return res.status(400).json({ 
        success: false,
        message: err.message 
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { title, author, description } = req.body;
    const bookFile = req.files['bookFile']?.[0];
    const coverImage = req.files['coverImage']?.[0];

    if (!title || !author || !description || !bookFile || !coverImage) {
      // Clean up uploaded files if validation fails
      if (bookFile) fs.unlinkSync(bookFile.path);
      if (coverImage) fs.unlinkSync(coverImage.path);
      return res.status(400).json({ 
        message: 'All fields and both files are required' 
      });
    }

    const newBook = new Book({
      title,
      author,
      description,
      fileUrl: `/uploads/${bookFile.filename}`,
      coverUrl: `/uploads/${coverImage.filename}`
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a separate endpoint for individual file uploads
router.post('/upload-file', auth, (req, res, next) => {
  const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'file') {
        cb(null, true);
      } else {
        cb(new Error('Unexpected field'), false);
      }
    }
  }).single('file');

  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ url: `/uploads/${req.file.filename}` });
  });
});

// Update book
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, author, description, fileUrl, coverUrl } = req.body;
    
    if (!title || !author || !description) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }
    
    const updateData = { title, author, description };
    if (fileUrl !== undefined) updateData.fileUrl = fileUrl;
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl;
    
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete book (with file cleanup)
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Delete associated files
    try {
      if (book.fileUrl) fs.unlinkSync(book.fileUrl);
      if (book.coverUrl) fs.unlinkSync(book.coverUrl);
    } catch (fileError) {
      console.error('Error deleting book files:', fileError);
    }

    // Delete from database
    await Book.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;