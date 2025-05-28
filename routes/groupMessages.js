import express from 'express';
import { getGroupMessages } from '../controllers/groupMessageController.js';

const router = express.Router();

// GET /group-messages - get all messages for a group
router.get('/', getGroupMessages);

export default router; 