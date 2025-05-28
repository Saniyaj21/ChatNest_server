import GlobalMessage from '../models/GlobalMessage.js';
import User from '../models/User.js';

/**
 * Save a global chat message to the database.
 * @param {Object} msg - The message data to save.
 * @returns {Promise<Object>} The saved message document.
 */
export const saveGlobalMessage = async (msg) => {
  try {
    console.log('Saving global message:', msg);
    const user = await User.findOne({ userId: msg.userId });
    if (!user) throw new Error('User not found');

    const messageData = {
      text: msg.text,
      userId: msg.userId, // Clerk userId
      user_id: user._id,  // MongoDB _id
      userName: msg.userName,
      userAvatar: msg.userAvatar,
      timestamp: msg.timestamp,
      image: msg.image,
      imagePublicId: msg.imagePublicId
    };

    console.log('Creating message with data:', messageData);
    const message = await GlobalMessage.create(messageData);
    console.log('Created message:', message);
    return message;
  } catch (error) {
    console.error('Error saving global message:', error);
    throw error;
  }
};

// Get all global messages
export const getGlobalMessages = async (req, res) => {
  try {
    const messages = await GlobalMessage.find()
      .populate('user_id', 'userName userAvatar')
      .sort({ timestamp: 1 });

    // Transform messages to include user details
    const transformedMessages = messages.map(msg => ({
      ...msg.toObject(),
      userName: msg.user_id?.userName || 'Anonymous',
      userAvatar: msg.user_id?.userAvatar || 'https://ui-avatars.com/api/?name=User'
    }));

    res.json(transformedMessages);
  } catch (error) {
    console.error('Error fetching global messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Alias for getGlobalMessages to maintain compatibility
export const getAllGlobalMessages = getGlobalMessages;