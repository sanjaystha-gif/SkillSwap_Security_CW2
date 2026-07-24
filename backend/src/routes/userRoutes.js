import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: view a user's profile
router.get('/:id', getProfile);

// Protected: update your own profile (expects auth middleware to set req.user)
router.put('/:id', authMiddleware, updateProfile);

export default router;
