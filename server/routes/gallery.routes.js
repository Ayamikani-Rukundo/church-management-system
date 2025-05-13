import express from 'express';
import Gallery from '../models/Gallery.js';
import auth from '../middleware/auth.js';
import { uploadSingleImage } from '../middleware/upload.js'; // Changed import name
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch gallery items',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get gallery item by ID
router.get('/:id', async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Gallery item not found' 
      });
    }
    res.json({
      success: true,
      data: galleryItem
    });
  } catch (error) {
    console.error('Error getting gallery item:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create gallery item
router.post('/', auth, uploadSingleImage, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description || !req.file) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        message: 'Title, description, and image are required' 
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
    console.error('Error creating gallery item:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error' });
  }
});
      
// Update gallery item (with optional file upload)
router.put('/:id', auth, uploadSingleImage, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(path.join(uploadsDir, req.file.filename));
      }
      return res.status(400).json({ 
        success: false,
        message: 'Title and description are required' 
      });
    }

    const existingItem = await Gallery.findById(req.params.id);
    if (!existingItem) {
      // Clean up uploaded file if item not found
      if (req.file) {
        fs.unlinkSync(path.join(uploadsDir, req.file.filename));
      }
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    const updateData = { 
      title,
      description,
      updatedAt: new Date()
    };
    
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
      
      // Delete old image file
      if (existingItem.imageUrl) {
        const oldFilename = existingItem.imageUrl.replace('/uploads/', '');
        fs.unlink(path.join(uploadsDir, oldFilename), (err) => {
          if (err) console.error('Error deleting old image:', err);
        });
      }
    }

    const updatedItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Gallery item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Update error:', error);
    
    if (req.file) {
      fs.unlink(path.join(uploadsDir, req.file.filename), () => {
        console.log('Cleaned up uploaded file after failed update');
      });
    }
    
    res.status(400).json({ 
      success: false,
      message: error.message || 'Failed to update gallery item',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Delete gallery item
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedItem = await Gallery.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Gallery item not found' 
      });
    }
    
    if (deletedItem.imageUrl) {
      const filename = deletedItem.imageUrl.replace('/uploads/', '');
      fs.unlink(path.join(uploadsDir, filename), (err) => {
        if (err) console.error('Error deleting image file:', err);
      });
    }
    
    res.json({ 
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete gallery item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;