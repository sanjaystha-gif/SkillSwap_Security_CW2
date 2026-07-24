import express from 'express';
import { listUsers, updateUserStatus, updateUserRole, getAuditLog } from '../controllers/adminController.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/users', requireRole('admin', 'moderator'), listUsers);
router.put('/users/:id/status', requireRole('admin'), updateUserStatus);
router.put('/users/:id/role', requireRole('admin'), updateUserRole);
router.get('/audit', requireRole('admin', 'moderator'), getAuditLog);

export default router;
