
const express = require('express');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

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

// Create book
router.post('/', auth, async (req, res) => {
  try {
    const { title, author, description, imageUrl, fileUrl } = req.body;
    
    // Validate input
    if (!title || !author || !description || !imageUrl) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }
    
    const newBook = new Book({
      title,
      author,
      description,
      imageUrl,
      fileUrl,
    });
    
    const savedBook = await newBook.save();
    
    res.status(201).json(savedBook);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update book
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, author, description, imageUrl, fileUrl } = req.body;
    
    // Validate input
    if (!title || !author || !description) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }
    
    // Create update object
    const updateData = { title, author, description };
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (fileUrl !== undefined) updateData.fileUrl = fileUrl;
    
    // Find and update
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

// Delete book
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    
    if (!deletedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
