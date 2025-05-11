import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Login user
router.post('/login', async (req, res) => {
  console.log('Login request received!', req.body);
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    // Check for existing user
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Validate password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create and sign JWT token
// When login succeeds:
const token = jwt.sign(
  { userId: user._id, email: user.email }, // Payload
  process.env.JWT_SECRET || 'fallback_secret',
  { expiresIn: '1d' } // Token expires in 1 day
);

// Send response
res.json({
  success: true,
  token,
  user: { id: user._id, name: user.name }
});
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create admin user (for setup)
router.post('/setup', async (req, res) => {
  try {
    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    
    const { username, password } = req.body;
    
    // Create new admin
    const newUser = new User({
      username,
      password,
      role: 'admin',
    });
    
    const savedUser = await newUser.save();
    
    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: savedUser._id,
        username: savedUser.username,
        role: savedUser.role,
      },
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;  // ES Modules export