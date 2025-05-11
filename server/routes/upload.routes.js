import express from 'express';
import upload from '../middleware/upload.js';
import path from 'path';

const router = express.Router();

/**
 * @route POST /api/upload
 * @desc Upload an image file
 * @access Private (Admin)
 */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded or invalid file type' 
      });
    }

 // Construct full URL to the uploaded file
 const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle multer errors specifically
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File too large. Maximum size is 10MB'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload file'
    });
  }
});

export default router;