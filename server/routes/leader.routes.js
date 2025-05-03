
const express = require('express');
const Leader = require('../models/Leader');
const auth = require('../middleware/auth');

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
      return res.status(400).json({ message: 'Please enter all fields' });
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
    res.status(500).json({ message: 'Server error' });
  }
});

// Update leader
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, position, bio, imageUrl } = req.body;
    
    // Validate input
    if (!name || !position || !bio) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }
    
    // Create update object
    const updateData = { name, position, bio };
    if (imageUrl) updateData.imageUrl = imageUrl;
    
    // Find and update
    const updatedLeader = await Leader.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedLeader) {
      return res.status(404).json({ message: 'Leader not found' });
    }
    
    res.json(updatedLeader);
  } catch (error) {
    console.error('Error updating leader:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete leader
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedLeader = await Leader.findByIdAndDelete(req.params.id);
    
    if (!deletedLeader) {
      return res.status(404).json({ message: 'Leader not found' });
    }
    
    res.json({ message: 'Leader deleted successfully' });
  } catch (error) {
    console.error('Error deleting leader:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
