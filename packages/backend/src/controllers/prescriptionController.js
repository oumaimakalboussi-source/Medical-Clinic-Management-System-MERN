import Prescription from '../models/Prescription.js';
import { asyncHandler, getPaginationParams, getSortOptions } from '../utils/helpers.js';

// Defensive formatter to avoid runtime errors when optional refs are missing
const formatPrescription = (presc) => {
  const consultationId = presc?.consultationId?._id || null;
  const patientId = presc?.patientId?._id || null;
  const doctorId = presc?.doctorId?._id || null;

  const patientName = presc?.patientId
    ? `${presc.patientId.prenom ?? ''} ${presc.patientId.nom ?? ''}`.trim() || 'Unknown'
    : 'Unknown';

  const doctorName = presc?.doctorId
    ? `${presc.doctorId.prenom ?? ''} ${presc.doctorId.nom ?? ''}`.trim() || 'Unknown'
    : 'Unknown';

  return {
    id: presc?._id,
    consultationId,
    patientId,
    patientName,
    doctorId,
    doctorName,
    dateCreated: presc?.dateCreated || null,
    medications: presc?.medications || [],
    notes: presc?.notes || '',
    status: presc?.status || 'draft',
  };
};

/**
 * Prescription Controller
 * Handles prescriptions with multiple medications
 */

export const getAllPrescriptions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'dateCreated', order = 'desc', status } = req.query;

  const { skip, limit: limitNum } = getPaginationParams(page, limit);
  const sort = getSortOptions(sortBy, order);

  const query = {};
  if (status) query.status = status;

  const [prescriptions, total] = await Promise.all([
    Prescription.find(query)
      .populate('patientId', 'nom prenom email')
      .populate('doctorId', 'nom prenom specialite')
      .populate('consultationId')
      .populate('medications.medicationId', 'name composition')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Prescription.countDocuments(query),
  ]);

  // Format response to match frontend expectations
  const formattedPrescriptions = prescriptions.map(formatPrescription);

  res.status(200).json({
    success: true,
    message: 'Prescriptions retrieved successfully',
    data: formattedPrescriptions,
    pagination: {
      total,
      page,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

export const getPrescriptionById = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patientId', 'nom prenom email')
    .populate('doctorId', 'nom prenom specialite')
    .populate('consultationId')
    .populate('medications.medicationId', 'name composition');

  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Prescription not found',
    });
  }

  const formatted = formatPrescription(prescription);

  res.status(200).json({
    success: true,
    message: 'Prescription retrieved successfully',
    data: formatted,
  });
});

export const createPrescription = asyncHandler(async (req, res) => {
  const { consultationId, patientId, doctorId, medications, notes, status = 'draft' } = req.body;

  // Validation
  if (!consultationId || !patientId || !doctorId || !medications || medications.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'consultationId, patientId, doctorId, and at least one medication are required',
    });
  }

  const prescription = await Prescription.create({
    consultationId,
    patientId,
    doctorId,
    medications,
    notes,
    status,
  });

  // Populate and format response
  await prescription.populate('patientId', 'nom prenom email');
  await prescription.populate('doctorId', 'nom prenom specialite');
  await prescription.populate('consultationId');
  await prescription.populate('medications.medicationId', 'name composition');

  const formatted = formatPrescription(prescription);

  res.status(201).json({
    success: true,
    message: 'Prescription created successfully',
    data: formatted,
  });
});

export const updatePrescription = asyncHandler(async (req, res) => {
  const { consultationId, patientId, doctorId, medications, notes, status } = req.body;

  const updateData = { consultationId, patientId, doctorId, medications, notes, status };

  // Remove undefined fields
  Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

  const prescription = await Prescription.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('patientId', 'nom prenom email')
    .populate('doctorId', 'nom prenom specialite')
    .populate('consultationId')
    .populate('medications.medicationId', 'name composition');

  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Prescription not found',
    });
  }

  const formatted = formatPrescription(prescription);

  res.status(200).json({
    success: true,
    message: 'Prescription updated successfully',
    data: formatted,
  });
});

export const deletePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findByIdAndDelete(req.params.id);

  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Prescription not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Prescription deleted successfully',
  });
});
