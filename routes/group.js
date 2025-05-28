import express from 'express';
import { createGroup, getAcceptedGroups } from '../controllers/groupController.js';

const router = express.Router();

// POST /groups - create group and send invites
router.post('/', createGroup);
// GET /groups/accepted - get groups where user is accepted member
router.get('/accepted', getAcceptedGroups);

export default router; 