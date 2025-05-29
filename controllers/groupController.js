import Group from '../models/Group.js';
import GroupMember from '../models/GroupMember.js';
import User from '../models/User.js';
import { deleteAllMessagesForGroup } from './groupMessageController.js';
import GroupMessage from '../models/GroupMessage.js';

// POST /groups - create group and send invites
export const createGroup = async (req, res) => {
  try {
    const { name, invitedUserIds, createdBy } = req.body;
    if (!name || !createdBy) {
      return res.status(400).json({ error: 'name and createdBy are required' });
    }
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

// GET /groups/accepted?userId=... - get groups where user is accepted member
export const getAcceptedGroups = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const memberships = await GroupMember.find({ userId: user._id, status: 'accepted' }).populate('groupId');
    // For each group, fetch the last message
    const groups = await Promise.all(memberships.map(async m => {
      const g = m.groupId;
      if (!g) return null;
      // Find the last message for this group
      const lastMsg = await GroupMessage.findOne({ groupId: g._id }).sort({ timestamp: -1 });
      let lastMessage = '';
      if (lastMsg) {
        lastMessage = lastMsg.image ? 'image' : (lastMsg.text || '');
      }
      return { _id: g._id, name: g.name, createdBy: g.createdBy, createdAt: g.createdAt, lastMessage };
    }));
    res.status(200).json({ groups: groups.filter(Boolean) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /groups/invites?userId=... - get pending invites for a user
export const getPendingInvites = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const invites = await GroupMember.find({ userId: user._id, status: 'pending' })
      .populate('groupId')
      .populate('invitedBy');
    // Format invites with group and inviter info
    const formatted = invites.map(invite => ({
      inviteId: invite._id,
      groupId: invite.groupId?._id,
      groupName: invite.groupId?.name,
      invitedBy: invite.invitedBy?.name || '',
      invitedById: invite.invitedBy?._id,
      createdAt: invite.createdAt,
    }));
    res.status(200).json({ invites: formatted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /groups/invites/accept - accept a group invite
export const acceptInvite = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    if (!groupId || !userId) return res.status(400).json({ error: 'groupId and userId are required' });
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const membership = await GroupMember.findOne({ groupId, userId: user._id, status: 'pending' });
    if (!membership) return res.status(404).json({ error: 'Invite not found' });
    membership.status = 'accepted';
    await membership.save();
    res.status(200).json({ message: 'Invite accepted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /groups/invites/reject - reject a group invite
export const rejectInvite = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    if (!groupId || !userId) return res.status(400).json({ error: 'groupId and userId are required' });
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const membership = await GroupMember.findOne({ groupId, userId: user._id, status: 'pending' });
    if (!membership) return res.status(404).json({ error: 'Invite not found' });
    await membership.deleteOne();
    res.status(200).json({ message: 'Invite rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /groups/:groupId/members - get all members of a group
export const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    if (!groupId) return res.status(400).json({ error: 'groupId is required' });

    // Find all accepted members of the group
    const memberships = await GroupMember.find({ 
      groupId, 
      status: 'accepted' 
    }).populate('userId');

    // Format the response
    const members = memberships.map(membership => ({
      _id: membership.userId._id,
      name: membership.userId.userName,
      email: membership.userId.userEmail,
      userAvatar: membership.userId.userAvatar,
      joinedAt: membership.createdAt
    }));

    res.status(200).json({ members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /groups/:groupId - delete a group and all its messages/images/members
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    if (!groupId) return res.status(400).json({ error: 'groupId is required' });
    // Delete all group messages and their images
    await deleteAllMessagesForGroup(groupId);
    // Delete all group members
    await GroupMember.deleteMany({ groupId });
    // Delete the group itself
    await Group.findByIdAndDelete(groupId);
    res.status(200).json({ message: 'Group and all related data deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete group' });
  }
}; 