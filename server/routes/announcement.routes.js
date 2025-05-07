import express from 'express';
import Announcement from '../models/Announcement.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: -1 });
    res.json(announcements);
  } catch (error) {
    console.error('Error getting announcements:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get announcement by ID
router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    res.json(announcement);
  } catch (error) {
    console.error('Error getting announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create announcement
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, date } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }
    
    const newAnnouncement = new Announcement({
      title,
      content,
      date: date || Date.now(),
    });
    
    const savedAnnouncement = await newAnnouncement.save();
    res.status(201).json(savedAnnouncement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update announcement
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, date } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }
    
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, content, date: date || Date.now() },
      { new: true }
    );
    
    if (!updatedAnnouncement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    res.json(updatedAnnouncement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete announcement
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedAnnouncement = await Announcement.findByIdAndDelete(req.params.id);
    
    if (!deletedAnnouncement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;