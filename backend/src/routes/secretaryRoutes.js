import express from 'express';
import {
  getAllSecretaries,
  getSecretaryById,
  createSecretary,
  updateSecretary,
  deleteSecretary,
} from '../controllers/secretaryController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Secretary Routes
 * All routes require authentication and admin role
 */

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', getAllSecretaries);
router.get('/:id', getSecretaryById);
router.post('/', createSecretary);
router.put('/:id', updateSecretary);
router.delete('/:id', deleteSecretary);

export default router;
