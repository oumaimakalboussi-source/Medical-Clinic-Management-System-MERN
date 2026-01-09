import express from 'express';
import {
  getAllPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
} from '../controllers/prescriptionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Prescription Routes
 * All routes require authentication
 * Create/Update require doctor role
 * Delete requires admin role
 */

router.use(authenticate);

// Public read routes (authenticated only)
router.get('/', getAllPrescriptions);
router.get('/:id', getPrescriptionById);

// Protected write routes
router.post('/', authorize('doctor', 'admin'), createPrescription);
router.put('/:id', authorize('doctor', 'admin'), updatePrescription);
router.delete('/:id', authorize('admin'), deletePrescription);

export default router;
