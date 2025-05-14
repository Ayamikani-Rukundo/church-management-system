import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  coverImage: { type: String },
  // In your Book model
  category: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

const Book = mongoose.model('Book', bookSchema);
export default Book;