import GlobalMessage from '../models/GlobalMessage.js';

/**
 * Save a global chat message to the database.
 * @param {Object} messageData - The message data to save.
 * @returns {Promise<Object>} The saved message document.
 */
export async function saveGlobalMessage(messageData) {
  try {
    const message = new GlobalMessage(messageData);
    const savedMessage = await message.save();
    return savedMessage;
  } catch (error) {
    throw error;
  }
}