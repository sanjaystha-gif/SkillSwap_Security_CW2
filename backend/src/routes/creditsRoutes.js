import express from 'express';
import { getBalance, addCredit } from '../controllers/creditsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user credit balance (public)
router.get('/:id/balance', getBalance);

// Add credit to own account (protected)
router.post('/me/add', authMiddleware, addCredit);

export default router;
