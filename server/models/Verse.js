import mongoose from 'mongoose';

const verseSchema = new mongoose.Schema({
  book: {
    type: String,
    required: [true, 'Book name is required']
  },
  chapter: {
    type: Number,
    required: [true, 'Chapter number is required']
  },
  verse: {
    type: Number,
    required: [true, 'Verse number is required']
  },
  text: {
    type: String,
    required: [true, 'Verse text is required']
  },
  translation: {
    type: String,
    default: 'NIV'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Verse', verseSchema);