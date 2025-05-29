import GroupMessage from '../models/GroupMessage.js';
import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Save a group message
export const saveGroupMessage = async (msg) => {
    try {
        console.log('Saving group message:', msg);
        const user = await User.findOne({ userId: msg.userId });
        if (!user) throw new Error('User not found');
        
        const messageData = {
            text: msg.text,
            userId: msg.userId, // Clerk userId
            user_id: user._id,  // MongoDB _id
            groupId: msg.groupId,
            userName: msg.userName,
            userAvatar: msg.userAvatar,
            timestamp: msg.timestamp,
            image: msg.image,
            imagePublicId: msg.imagePublicId
        };
        console.log('Creating message with data:', messageData);
        
        const message = await GroupMessage.create(messageData);
        console.log('Created message:', message);
        return message;
    } catch (error) {
        console.error('Error saving group message:', error);
        throw error;
    }
};

// Get all messages for a group
export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.query;
        if (!groupId) {
            return res.status(400).json({ error: 'Group ID is required' });
        }

        console.log('Fetching messages for group:', groupId);
        const messages = await GroupMessage.find({ groupId })
            .populate('user_id', 'userName userAvatar')
            .sort({ timestamp: 1 });

        // Transform messages to include user details with fallbacks
        const transformedMessages = messages.map(msg => {
            const userData = msg.user_id || {};
            return {
                ...msg.toObject(),
                userName: userData.userName || msg.userName || 'Anonymous',
                userAvatar: userData.userAvatar || msg.userAvatar || 'https://ui-avatars.com/api/?name=User'
            };
        });

        console.log('Transformed messages:', transformedMessages);
        res.json(transformedMessages);
    } catch (error) {
        console.error('Error fetching group messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// Delete all messages for a group, including images from Cloudinary
export const deleteAllMessagesForGroup = async (groupId) => {
  try {
    const messages = await GroupMessage.find({ groupId });
    // Delete images from Cloudinary
    for (const msg of messages) {
      if (msg.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(msg.imagePublicId);
        } catch (err) {
          console.error('Failed to delete image from Cloudinary:', err);
        }
      }
    }
    // Delete messages from DB
    await GroupMessage.deleteMany({ groupId });
  } catch (error) {
    console.error('Error deleting group messages:', error);
    throw error;
  }
}; 