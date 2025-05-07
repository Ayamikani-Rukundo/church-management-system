import mongoose from 'mongoose';

const verseSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: true,
    trim: true,
  },
  text: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Verse', verseSchema);