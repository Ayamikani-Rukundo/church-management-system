import mongoose from 'mongoose';

const leaderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  bio: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  church: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Church',
    required: false // Changed to optional
  },
  createdAt: { type: Date, default: Date.now }
});

const Leader = mongoose.model('Leader', leaderSchema);

export default Leader;