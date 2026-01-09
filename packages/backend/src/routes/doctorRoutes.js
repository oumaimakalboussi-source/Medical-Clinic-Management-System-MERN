import express from 'express';
import {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Doctor Routes
 * Most routes require authentication
 * Create/Update/Delete require admin role
 */

router.use(authenticate);

// Public read routes
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);

// Protected write routes
router.post('/', authorize('admin'), createDoctor);
router.put('/:id', authorize('admin'), updateDoctor);
router.delete('/:id', authorize('admin'), deleteDoctor);

export default router;
