import mongoose from 'mongoose';

const churchSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Church = mongoose.model('Church', churchSchema);

export default Church;