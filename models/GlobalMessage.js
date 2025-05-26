import mongoose from 'mongoose';

const globalMessageSchema = new mongoose.Schema({
  text: {
    type: String
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userAvatar: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  image: {
    type: String,
    default: '',
  },
  imagePublicId: {
    type: String,
    default: '',
  },
});

const GlobalMessage = mongoose.model('GlobalMessage', globalMessageSchema);

export default GlobalMessage; 