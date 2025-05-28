import mongoose from 'mongoose';

const groupMessageSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String
    },
    image: {
        type: String,
    },
    imagePublicId: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);

export default GroupMessage; 