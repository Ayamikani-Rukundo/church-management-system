
const mongoose = require('mongoose');

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

module.exports = mongoose.model('Verse', verseSchema);
