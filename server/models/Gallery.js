import mongoose from 'mongoose';
import validator from 'validator';

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
    validate: {
      validator: function(v) {
        return !validator.isEmpty(v);
      },
      message: 'Title cannot be empty'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    validate: {
      validator: function(v) {
        return validator.isURL(v, {
          protocols: ['http', 'https'],
          require_protocol: true,
          allow_underscores: true
        });
      },
      message: 'Invalid image URL format'
    }
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.length <= 10;
      },
      message: 'Cannot have more than 10 tags'
    }
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Add text index for search functionality
gallerySchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for thumbnail URL
gallerySchema.virtual('thumbnailUrl').get(function() {
  return this.imageUrl.replace('/upload/', '/upload/w_300,h_300,c_fill/');
});

// Query helper for featured items
gallerySchema.query.featured = function() {
  return this.where({ isFeatured: true });
};

const Gallery = mongoose.model('Gallery', gallerySchema);

export default Gallery;