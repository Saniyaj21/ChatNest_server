import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';

// Check if user exists by Clerk userId, create if not
export const checkOrCreateUser = async (req, res) => {
  try {
    const { userId, name, userAvatar, userName, profilePicture, userEmail } = req.body;
    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({ userId, name, userAvatar, userName, profilePicture, userEmail });
    }
    res.status(200).json({ user });
  } catch (error) {
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
    console.log(req.body);
    
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // If a new profile picture is provided and the user has an old one, delete the old image from Cloudinary
    if (profilePicture && profilePicture.publicId && user.profilePicture && user.profilePicture.publicId) {
      try {
        await cloudinary.uploader.destroy(user.profilePicture.publicId);
        console.log('Deleted old profile picture from Cloudinary:', user.profilePicture.publicId);
      } catch (err) {
        console.error('Failed to delete old profile picture from Cloudinary:', err);
      }
    }

    // Prepare update object
    const update = {};
    if (userName) update.userName = userName;
    if (profilePicture) {
      update.profilePicture = profilePicture;
      update.userAvatar = profilePicture.url; // Always set avatar to match profile picture
    }

    const updatedUser = await User.findOneAndUpdate({ userId }, update, { new: true });
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /user/search?email=... - search users by email (partial, case-insensitive)
export const searchUsersByEmail = async (req, res) => {
  try {
    const { email, excludeUserId } = req.query;
    if (!email) return res.status(400).json({ error: 'email query is required' });
    const query = {
      userEmail: { $regex: email, $options: 'i' },
    };
    if (excludeUserId) {
      query.userId = { $ne: excludeUserId };
    }
    const users = await User.find(query, '_id name userName userEmail userAvatar');
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 