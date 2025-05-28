import express from 'express';
import { createGroup, getAcceptedGroups, getPendingInvites, acceptInvite, rejectInvite } from '../controllers/groupController.js';

const router = express.Router();

// POST /groups - create group and send invites
router.post('/', createGroup);
// GET /groups/accepted - get groups where user is accepted member
router.get('/accepted', getAcceptedGroups);
// GET /groups/invites - get pending invites for a user
router.get('/invites', getPendingInvites);
// POST /groups/invites/accept - accept a group invite
router.post('/invites/accept', acceptInvite);
// POST /groups/invites/reject - reject a group invite
router.post('/invites/reject', rejectInvite);

export default router; 