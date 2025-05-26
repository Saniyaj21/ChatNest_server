import GlobalMessage from '../models/GlobalMessage.js';

/**
 * Save a global chat message to the database.
 * @param {Object} messageData - The message data to save.
 * @returns {Promise<Object>} The saved message document.
 */
export const saveGlobalMessage = async (messageData) => {
  try {
    const message = new GlobalMessage(messageData);
    const savedMessage = await message.save();
    return savedMessage;
  } catch (error) {
    throw error;
  }
};

// Get all global messages
export const getAllGlobalMessages = async (req, res) => {
  try {
    const messages = await GlobalMessage.find();
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch global messages' });
  }
};