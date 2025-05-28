import Group from '../models/Group.js';
import GroupMember from '../models/GroupMember.js';
import User from '../models/User.js';

// POST /groups - create group and send invites
export const createGroup = async (req, res) => {
  try {
    const { name, invitedUserIds, createdBy } = req.body;
    if (!name || !createdBy) {
      return res.status(400).json({ error: 'name and createdBy are required' });
    }
    console.log('Received group payload:', req.body);
    // Look up creator by Clerk userId
    const creator = await User.findOne({ userId: createdBy });
    if (!creator) {
      return res.status(404).json({ error: 'Creator user not found' });
    }
    // Create group with creator's _id
    const group = await Group.create({ name, createdBy: creator._id });
    // Add creator as accepted member
    await GroupMember.create({
      groupId: group._id,
      userId: creator._id,
      status: 'accepted',
      invitedBy: creator._id,
    });
    // Add invited users as pending
    if (Array.isArray(invitedUserIds) && invitedUserIds.length > 0) {
      const inviteDocs = invitedUserIds.map(userMongoId => ({
        groupId: group._id,
        userId: userMongoId, // MongoDB ObjectId string
        status: 'pending',
        invitedBy: creator._id,
      }));
      await GroupMember.insertMany(inviteDocs);
    }
    res.status(201).json({ group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 