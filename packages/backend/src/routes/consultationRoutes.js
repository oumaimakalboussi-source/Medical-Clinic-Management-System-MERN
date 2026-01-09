import express from 'express';
import {
  getAllConsultations,
  getConsultationById,
  createConsultation,
  updateConsultation,
  deleteConsultation,
} from '../controllers/consultationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Consultation Routes
 * All routes require authentication
 * Create/Update require doctor role
 * Delete requires admin role
 */

router.use(authenticate);

// Public read routes
router.get('/', getAllConsultations);
router.get('/:id', getConsultationById);

// Protected write routes
router.post('/', authorize('doctor', 'admin'), createConsultation);
router.put('/:id', authorize('doctor', 'admin'), updateConsultation);
router.delete('/:id', authorize('admin'), deleteConsultation);

export default router;
