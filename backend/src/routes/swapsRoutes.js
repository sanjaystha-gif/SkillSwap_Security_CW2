import express from 'express';
import { listSwaps, createSwap, respondSwap } from '../controllers/swapsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', listSwaps);
router.post('/', authMiddleware, createSwap);
router.post('/:id/respond', authMiddleware, respondSwap);

export default router;
