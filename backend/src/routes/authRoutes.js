import express from 'express';
import {
  registerUser,
  verifyEmail,
  login,
  verifyMFA,
  logout,
  refreshToken,
} from '../controllers/authController.js';

const router = express.Router();

// Public routes (no auth required)
router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/login/mfa', verifyMFA);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

export default router;
