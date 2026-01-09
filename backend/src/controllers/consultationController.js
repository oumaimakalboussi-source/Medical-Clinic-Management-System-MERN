import Consultation from '../models/Consultation.js';
import Appointment from '../models/Appointment.js';
import { asyncHandler, getPaginationParams, getSortOptions } from '../utils/helpers.js';

/**
 * Consultation Controller
 * Handles consultation records linked to appointments
 */

export const getAllConsultations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'dateTime', order = 'desc', status } = req.query;

  const { skip, limit: limitNum } = getPaginationParams(page, limit);
  const sort = getSortOptions(sortBy, order);

  const query = {};
  if (status) query.status = status;

  const [consultations, total] = await Promise.all([
    Consultation.find(query)
      .populate('patientId', 'nom prenom email')
      .populate('doctorId', 'nom prenom specialite')
      .populate('appointmentId')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Consultation.countDocuments(query),
  ]);

  // Format response to match frontend expectations
  const formattedConsultations = consultations.map((cons) => ({
    id: cons._id,
    appointmentId: cons.appointmentId._id,
    patientId: cons.patientId._id,
    patientName: `${cons.patientId.prenom} ${cons.patientId.nom}`,
    doctorId: cons.doctorId._id,
    doctorName: `${cons.doctorId.prenom} ${cons.doctorId.nom}`,
    dateTime: cons.dateTime,
    diagnosis: cons.diagnosis,
    treatment: cons.treatment,
    notes: cons.notes,
    status: cons.status,
  }));

  res.status(200).json({
    success: true,
    message: 'Consultations retrieved successfully',
    data: formattedConsultations,
    pagination: {
      total,
      page,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

export const getConsultationById = asyncHandler(async (req, res) => {
  const consultation = await Consultation.findById(req.params.id)
    .populate('patientId', 'nom prenom email')
    .populate('doctorId', 'nom prenom specialite')
    .populate('appointmentId');

  if (!consultation) {
    return res.status(404).json({
      success: false,
      message: 'Consultation not found',
    });
  }

  const formatted = {
    id: consultation._id,
    appointmentId: consultation.appointmentId._id,
    patientId: consultation.patientId._id,
    patientName: `${consultation.patientId.prenom} ${consultation.patientId.nom}`,
    doctorId: consultation.doctorId._id,
    doctorName: `${consultation.doctorId.prenom} ${consultation.doctorId.nom}`,
    dateTime: consultation.dateTime,
    diagnosis: consultation.diagnosis,
    treatment: consultation.treatment,
    notes: consultation.notes,
    status: consultation.status,
  };

  res.status(200).json({
    success: true,
    message: 'Consultation retrieved successfully',
    data: formatted,
  });
});

export const createConsultation = asyncHandler(async (req, res) => {
  const { appointmentId, patientId, doctorId, dateTime, diagnosis, treatment, notes, status = 'in-progress' } = req.body;

  // Validation
  if (!appointmentId || !patientId || !doctorId || !diagnosis) {
    return res.status(400).json({
      success: false,
      message: 'appointmentId, patientId, doctorId, and diagnosis are required',
    });
  }

  // Verify appointment exists
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found',
    });
  }

  const consultation = await Consultation.create({
    appointmentId,
    patientId,
    doctorId,
    dateTime: dateTime || appointment.dateTime,
    diagnosis,
    treatment,
    notes,
    status,
  });

  // Populate and format response
  await consultation.populate('patientId', 'nom prenom email');
  await consultation.populate('doctorId', 'nom prenom specialite');
  await consultation.populate('appointmentId');

  const formatted = {
    id: consultation._id,
    appointmentId: consultation.appointmentId._id,
    patientId: consultation.patientId._id,
    patientName: `${consultation.patientId.prenom} ${consultation.patientId.nom}`,
    doctorId: consultation.doctorId._id,
    doctorName: `${consultation.doctorId.prenom} ${consultation.doctorId.nom}`,
    dateTime: consultation.dateTime,
    diagnosis: consultation.diagnosis,
    treatment: consultation.treatment,
    notes: consultation.notes,
    status: consultation.status,
  };

  res.status(201).json({
    success: true,
    message: 'Consultation created successfully',
    data: formatted,
  });
});

export const updateConsultation = asyncHandler(async (req, res) => {
  const { appointmentId, patientId, doctorId, dateTime, diagnosis, treatment, notes, status } = req.body;

  const updateData = { appointmentId, patientId, doctorId, dateTime, diagnosis, treatment, notes, status };

  // Remove undefined fields
  Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

  const consultation = await Consultation.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('patientId', 'nom prenom email')
    .populate('doctorId', 'nom prenom specialite')
    .populate('appointmentId');

  if (!consultation) {
    return res.status(404).json({
      success: false,
      message: 'Consultation not found',
    });
  }

  const formatted = {
    id: consultation._id,
    appointmentId: consultation.appointmentId._id,
    patientId: consultation.patientId._id,
    patientName: `${consultation.patientId.prenom} ${consultation.patientId.nom}`,
    doctorId: consultation.doctorId._id,
    doctorName: `${consultation.doctorId.prenom} ${consultation.doctorId.nom}`,
    dateTime: consultation.dateTime,
    diagnosis: consultation.diagnosis,
    treatment: consultation.treatment,
    notes: consultation.notes,
    status: consultation.status,
  };

  res.status(200).json({
    success: true,
    message: 'Consultation updated successfully',
    data: formatted,
  });
});

export const deleteConsultation = asyncHandler(async (req, res) => {
  const consultation = await Consultation.findByIdAndDelete(req.params.id);

  if (!consultation) {
    return res.status(404).json({
      success: false,
      message: 'Consultation not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Consultation deleted successfully',
  });
});
