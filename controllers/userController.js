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

// GET user profile by userId (from query or body)
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT update user profile (userName, profilePicture) by userId
export const updateUserProfile = async (req, res) => {
  try {
    const { userId, userName, profilePicture } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const update = {};
    if (userName) update.userName = userName;
    if (profilePicture) update.profilePicture = profilePicture;
    const user = await User.findOneAndUpdate({ userId }, update, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 