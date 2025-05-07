import express from 'express';
import Gallery from '../models/Gallery.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const router = express.Router();

// Get all gallery items
router.get('/', async (req, res) => {
  try {
    const galleryItems = await Gallery.find().sort({ createdAt: -1 });
    res.json(galleryItems);
  } catch (error) {
    console.error('Error getting gallery items:', error);
    res.status(500).json({ message: 'Failed to fetch gallery items' });
  }
});

// Get gallery item by ID
router.get('/:id', async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json(galleryItem);
  } catch (error) {
    console.error('Error getting gallery item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create gallery item (with file upload)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description || !req.file) {
      return res.status(400).json({ 
        message: 'Title, description and image are required' 
      });
    }

    const newItem = new Gallery({
      title,
      description,
      imageUrl: `/uploads/${req.file.filename}`
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Create error:', error);
    
    // Clean up uploaded file if saving to DB failed
    if (req.file) {
      fs.unlink(path.join(uploadsDir, req.file.filename), () => {});
    }
    
    res.status(400).json({ 
      message: error.message || 'Failed to create gallery item' 
    });
  }
});

// Update gallery item (with optional file upload)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ 
        message: 'Title and description are required' 
      });
    }

    const updateData = { title, description };
    
    // Handle new image upload if present
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
      
      // Delete old image file
      const existingItem = await Gallery.findById(req.params.id);
      if (existingItem?.imageUrl) {
        const oldFilename = existingItem.imageUrl.replace('/uploads/', '');
        fs.unlink(path.join(uploadsDir, oldFilename), () => {});
      }
    }

    const updatedItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    res.json(updatedItem);
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ 
      message: error.message || 'Failed to update gallery item' 
    });
  }
});

// Delete gallery item
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedItem = await Gallery.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    
    // Delete associated image file
    if (deletedItem.imageUrl) {
      const filename = deletedItem.imageUrl.replace('/uploads/', '');
      fs.unlink(path.join(uploadsDir, filename), () => {});
    }
    
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete gallery item' });
  }
});

export default router;