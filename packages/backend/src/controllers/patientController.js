import { asyncHandler } from '../utils/helpers.js';
import { patientService } from '../application/services/patientService.js';

/**
 * Patient Controller
 * Handles patient profile management
 */

export const getAllPatients = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'asc', search } = req.query;
  const { patients, pagination } = await patientService.list({ page, limit, sortBy, order, search });
  res.status(200).json({ success: true, message: 'Patients retrieved successfully', data: patients, pagination });
});

export const getPatientById = asyncHandler(async (req, res) => {
  const patient = await patientService.getById(req.params.id);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }
  res.status(200).json({ success: true, message: 'Patient retrieved successfully', data: patient });
});

export const createPatient = asyncHandler(async (req, res) => {
  const patient = await patientService.create(req.body);
  res.status(201).json({ success: true, message: 'Patient created successfully', data: patient });
});

export const updatePatient = asyncHandler(async (req, res) => {
  const patient = await patientService.update(req.params.id, req.body);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }
  res.status(200).json({ success: true, message: 'Patient updated successfully', data: patient });
});

export const deletePatient = asyncHandler(async (req, res) => {
  const patient = await patientService.remove(req.params.id);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }
  res.status(200).json({ success: true, message: 'Patient deleted successfully' });
});

export const searchPatients = asyncHandler(async (req, res) => {
  const { q = '' } = req.query;
  const patients = await patientService.search(q);
  res.status(200).json({ success: true, message: 'Search results', data: patients });
});
