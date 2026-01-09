import express from 'express';
import {
  getAllMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
} from '../controllers/medicationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Medication Routes
 * Public read routes
 * Write routes require admin role
 */

router.get('/', getAllMedications);
router.get('/:id', getMedicationById);

router.use(authenticate);
router.use(authorize('admin'));

router.post('/', createMedication);
router.put('/:id', updateMedication);
router.delete('/:id', deleteMedication);

export default router;
