import express from 'express';
import { checkOrCreateUser, getUserProfile, updateUserProfile } from '../controllers/userController.js';

const router = express.Router();

// POST /user - check or create user by Clerk userId
router.post('/', checkOrCreateUser);

// GET /user/profile - get user profile by userId (from query or body)
router.get('/profile', getUserProfile);

// PUT /user/profile - update user profile by userId
router.put('/profile', updateUserProfile);

export default router; 