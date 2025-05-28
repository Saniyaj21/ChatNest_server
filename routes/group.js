import express from 'express';
import { createGroup } from '../controllers/groupController.js';

const router = express.Router();

// POST /groups - create group and send invites
router.post('/', createGroup);

export default router; 