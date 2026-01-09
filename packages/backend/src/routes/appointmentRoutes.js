import express from 'express';
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByDoctor,
  getAppointmentsByPatient,
} from '../controllers/appointmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Appointment Routes
 * All routes require authentication
 * Create/Update/Delete require admin, secretary, or patient role
 */

router.use(authenticate);

// Public read routes
router.get('/', getAllAppointments);
router.get('/doctor/:doctorId', getAppointmentsByDoctor);
router.get('/patient/:patientId', getAppointmentsByPatient);
router.get('/:id', getAppointmentById);

// Protected write routes
router.post('/', authorize('admin', 'secretary', 'patient'), createAppointment);
router.put('/:id', authorize('admin', 'secretary'), updateAppointment);
router.delete('/:id', authorize('admin', 'secretary'), deleteAppointment);

export default router;
