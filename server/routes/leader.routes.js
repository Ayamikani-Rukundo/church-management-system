import express from 'express';
import Leader from '../models/Leader.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all leaders
router.get('/', async (req, res) => {
  try {
    const leaders = await Leader.find().sort({ name: 1 });
    res.json(leaders);
  } catch (error) {
    console.error('Error getting leaders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leader by ID
router.get('/:id', async (req, res) => {
  try {
    const leader = await Leader.findById(req.params.id);
    
    if (!leader) {
      return res.status(404).json({ message: 'Leader not found' });
    }
    
    res.json(leader);
  } catch (error) {
    console.error('Error getting leader:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create leader
router.post('/', auth, async (req, res) => {
  try {
    const { name, position, bio, imageUrl } = req.body;
    
    // Validate input
    if (!name || !position || !bio || !imageUrl) {
      return res.status(400).json({ 
        message: 'Please provide all fields: name, position, bio, imageUrl' 
      });
    }
    
    const newLeader = new Leader({
      name,
      position,
      bio,
      imageUrl,
    });
    
    const savedLeader = await newLeader.save();
    res.status(201).json(savedLeader);
  } catch (error) {
    console.error('Error creating leader:', error);
    res.status(500).json({ 
      message: 'Error creating leader',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update leader
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, position, bio, imageUrl } = req.body;
    
    if (!name || !position || !bio) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, position, or bio' 
      });
    }
    
    const updatedLeader = await Leader.findByIdAndUpdate(
      req.params.id,
      { name, position, bio, ...(imageUrl && { imageUrl }) },
      { new: true, runValidators: true }
    );
    
    if (!updatedLeader) {
      return res.status(404).json({ message: 'Leader not found' });
    }
    
    res.json(updatedLeader);
  } catch (error) {
    console.error('Error updating leader:', error);
    res.status(500).json({ 
      message: 'Error updating leader',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete leader
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedLeader = await Leader.findByIdAndDelete(req.params.id);
    
    if (!deletedLeader) {
      return res.status(404).json({ message: 'Leader not found' });
    }
    
    res.json({ 
      message: 'Leader deleted successfully',
      deletedId: deletedLeader._id 
    });
  } catch (error) {
    console.error('Error deleting leader:', error);
    res.status(500).json({ 
      message: 'Error deleting leader',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;