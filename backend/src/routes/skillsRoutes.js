import express from 'express';
import {
  listSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
} from '../controllers/skillsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', listSkills);
router.get('/:id', getSkill);

// Protected endpoints
router.post('/', authMiddleware, createSkill);
router.put('/:id', authMiddleware, updateSkill);
router.delete('/:id', authMiddleware, deleteSkill);

export default router;
