import express from 'express';
import { getAllGlobalMessages } from '../controllers/globalMessageController.js';

const router = express.Router();

// GET all global messages
router.get('/', getAllGlobalMessages);

export default router; 