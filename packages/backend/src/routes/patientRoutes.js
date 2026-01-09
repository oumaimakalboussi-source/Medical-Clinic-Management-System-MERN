import express from 'express';
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients,
  getCurrentPatient,
} from '../controllers/patientController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Patient Routes
 * Most routes require authentication
 * Create/Update/Delete require admin or secretary role
 */

router.use(authenticate);

// Get current patient's profile (authenticated patient only)
router.get('/me', getCurrentPatient);

// Public read routes (for authenticated users)
router.get('/', getAllPatients);
router.get('/search', searchPatients);
router.get('/:id', getPatientById);

// Protected write routes
router.post('/', authorize('admin', 'secretary'), createPatient);
router.put('/:id', authorize('admin', 'secretary'), updatePatient);
router.delete('/:id', authorize('admin', 'secretary'), deletePatient);

export default router;
