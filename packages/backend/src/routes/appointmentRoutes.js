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
 * Appointment Routes with Role-Based Access Control
 * 
 * All routes require authentication
 * 
 * Access Matrix:
 * GET    /                    - Patients: own appointments | Admin/Secretary/Doctor: all
 * GET    /:id                 - Patients: own appointment | Admin/Secretary/Doctor: any
 * GET    /doctor/:doctorId    - Admin/Secretary/Doctor only
 * GET    /patient/:patientId  - Admin/Secretary only
 * POST   /                    - Patients (for themselves), Admin, Secretary
 * PUT    /:id                 - Admin, Secretary only
 * DELETE /:id                 - Admin, Secretary only
 */

router.use(authenticate);

// ========== READ OPERATIONS ==========
// Get all appointments (filtered by patient if patient role)
router.get('/', getAllAppointments);

// Get specific appointment (patient can only access their own)
router.get('/:id', getAppointmentById);

// Get appointments by doctor (admin/secretary/doctor only)
router.get('/doctor/:doctorId', authorize('admin', 'secretary', 'doctor'), getAppointmentsByDoctor);

// Get appointments by patient (admin/secretary only - patient uses general GET)
router.get('/patient/:patientId', authorize('admin', 'secretary'), getAppointmentsByPatient);

// ========== WRITE OPERATIONS ==========
// Create appointment (patients for themselves, admin/secretary for anyone)
router.post('/',
  authorize('admin', 'secretary', 'patient'),
  createAppointment
);

// Update appointment (admin/secretary only - patients blocked in controller)
router.put('/:id',
  authorize('admin', 'secretary'),
  updateAppointment
);

// Delete appointment (admin/secretary only - patients blocked in controller)
router.delete('/:id',
  authorize('admin', 'secretary'),
  deleteAppointment
);

export default router;
