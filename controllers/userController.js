import User from '../models/User.js';

// Check if user exists by Clerk userId, create if not
export const checkOrCreateUser = async (req, res) => {
  try {
    console.log('Received user payload:', req.body);
    const { userId, name, userAvatar, userName, profilePicture, userEmail } = req.body;
    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({ userId, name, userAvatar, userName, profilePicture, userEmail });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error in checkOrCreateUser:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
}; 