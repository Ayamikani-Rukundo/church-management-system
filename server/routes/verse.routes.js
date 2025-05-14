import express from 'express';
import Verse from '../models/Verse.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all verses
router.get('/', async (req, res) => {
  try {
    const verses = await Verse.find().sort({ createdAt: -1 });
    res.json(verses);
  } catch (error) {
    console.error('Error getting verses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get verse by ID
router.get('/:id', async (req, res) => {
  try {
    const verse = await Verse.findById(req.params.id);
    
    if (!verse) {
      return res.status(404).json({ message: 'Verse not found' });
    }
    
    res.json(verse);
  } catch (error) {
    console.error('Error getting verse:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Create verse

// POST - Create Verse (EXACTLY like announcements.js)
router.post('/', auth, async (req, res) => {
  try {
    // 1. Parse reference like announcement titles
    const [book, chapterVerse] = req.body.reference.split(' ');
    const [chapter, verse] = chapterVerse.split(':');

    // 2. Create new verse (same structure as announcements)
    const newVerse = new Verse({
      book,
      chapter: Number(chapter),
      verse: Number(verse),
      reference: req.body.reference,
      text: req.body.text,
      translation: req.body.translation || 'NIV'
    });

    // 3. Save and respond (identical pattern)
    await newVerse.save();
    res.status(201).json(newVerse);

  } catch (error) {
    // 4. Error handling (copy from announcements.js)
    res.status(500).json({ 
      message: error.message || 'Server error' 
    });
  }
});

// Update verse
router.put('/:id', auth, async (req, res) => {
  try {
    const { reference, text } = req.body;
    
    if (!reference || !text) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    const updatedVerse = await Verse.findByIdAndUpdate(
      req.params.id,
      { reference, text },
      { new: true }
    );
    
    if (!updatedVerse) {
      return res.status(404).json({ message: 'Verse not found' });
    }
    
    res.json(updatedVerse);
  } catch (error) {
    console.error('Error updating verse:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete verse
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedVerse = await Verse.findByIdAndDelete(req.params.id);
    
    if (!deletedVerse) {
      return res.status(404).json({ message: 'Verse not found' });
    }
    
    res.json({ message: 'Verse deleted successfully' });
  } catch (error) {
    console.error('Error deleting verse:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;