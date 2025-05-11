import express from 'express';
import Leader from '../models/Leader.js';
import auth from '../middleware/auth.js';
import mongoose from 'mongoose'; // Add this import
import CHurch from '../models/church.js'

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

// Create Leader
router.post('/', async (req, res) => {
  try {
    const { name, position, bio, imageUrl, church } = req.body;

    // Validate required fields
    if (!name || !position || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Name, position and image are required'
      });
    }

      // Verify church exists using the Church model
      const Church = mongoose.model('Church');
      const churchExists = await Church.exists({ _id: church });

    if (!churchExists) {
      return res.status(400).json({
        success: false,
        message: 'Specified church does not exist'
      });
    }

    const leader = new Leader({
      name,
      position,
      bio,
      imageUrl,
      church
    });

    await leader.save();

    res.status(201).json({
      success: true,
      data: leader
    });

  } catch (error) {
    console.error('Leader creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create leader'
    });
  }
});

// Update Leader
router.put('/:id', async (req, res) => {
  try {
    const updatedLeader = await Leader.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedLeader) {
      return res.status(404).json({
        success: false,
        message: 'Leader not found'
      });
    }

    res.json({
      success: true,
      data: updatedLeader
    });

  } catch (error) {
    console.error('Leader update error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update leader'
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