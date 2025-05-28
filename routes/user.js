import express from 'express';
import { checkOrCreateUser } from '../controllers/userController.js';

const router = express.Router();

// POST /user - check or create user by Clerk userId
router.post('/', checkOrCreateUser);

export default router; 