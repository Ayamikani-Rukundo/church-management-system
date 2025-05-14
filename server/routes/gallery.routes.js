import express from 'express';
import Gallery from '../models/Gallery.js';
import auth from '../middleware/auth.js';
import { uploadSingleImage } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const router = express.Router();

// Get all items
router.get('/', async (req, res) => {
  try {
    const items = await Gallery.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new item
router.post('/', auth, uploadSingleImage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const newItem = new Gallery({
      title: req.body.title,
      description: req.body.description,
      imageUrl: `/uploads/${req.file.filename}`
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) fs.unlinkSync(path.join(uploadsDir, req.file.filename));
    res.status(500).json({ message: 'Server error' });
  }
});

// Update item
router.put('/:id', auth, uploadSingleImage, async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Delete old image if new one is uploaded
    if (req.file) {
      const oldImage = path.join(uploadsDir, item.imageUrl.replace('/uploads/', ''));
      if (fs.existsSync(oldImage)) fs.unlinkSync(oldImage);
    }

    const updatedItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : item.imageUrl
      },
      { new: true }
    );

    res.json(updatedItem);
  } catch (error) {
    if (req.file) fs.unlinkSync(path.join(uploadsDir, req.file.filename));
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Delete associated image
    const imagePath = path.join(uploadsDir, item.imageUrl.replace('/uploads/', ''));
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;