import mongoose from 'mongoose';

const leaderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  bio: {
    type: String,
    required: [true, 'Bio is required'],
    minlength: [10, 'Bio must be at least 10 characters'],
    maxlength: [2000, 'Bio cannot exceed 2000 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    validate: {
      validator: function(v) {
        return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
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
  toObject: {
    virtuals: true
  }
});
// Example for adding church relationship
leaderSchema.add({
  church: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Church',
    required: true
  }
});

// Optional: Add virtuals or methods here
leaderSchema.virtual('shortBio').get(function() {
  return this.bio.length > 100 
    ? this.bio.substring(0, 100) + '...' 
    : this.bio;
});

const Leader = mongoose.model('Leader', leaderSchema);

export default Leader;