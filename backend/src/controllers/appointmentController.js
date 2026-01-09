import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { asyncHandler, getPaginationParams, getSortOptions } from '../utils/helpers.js';

/**
 * Appointment Controller
 * Handles appointment/rendez-vous management
 */

export const getAllAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'dateTime', order = 'asc', status } = req.query;

  const { skip, limit: limitNum } = getPaginationParams(page, limit);
  const sort = getSortOptions(sortBy, order);

  const query = {};
  if (status) query.status = status;

  const [appointments, total] = await Promise.all([
    Appointment.find(query)
      .populate('patientId', 'nom prenom email telephone')
      .populate('doctorId', 'nom prenom email specialite')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Appointment.countDocuments(query),
  ]);

  // Format response to match frontend expectations
  const formattedAppointments = appointments.map((apt) => ({
    id: apt._id,
    patientId: apt.patientId._id,
    patientName: `${apt.patientId.prenom} ${apt.patientId.nom}`,
    doctorId: apt.doctorId._id,
    doctorName: `${apt.doctorId.prenom} ${apt.doctorId.nom}`,
    dateTime: apt.dateTime,
    reason: apt.reason,
    status: apt.status,
    notes: apt.notes,
  }));

  res.status(200).json({
    success: true,
    message: 'Appointments retrieved successfully',
    data: formattedAppointments,
    pagination: {
      total,
      page,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

export const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patientId', 'nom prenom email telephone')
    .populate('doctorId', 'nom prenom email specialite');

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found',
    });
  }

  const formatted = {
    id: appointment._id,
    patientId: appointment.patientId._id,
    patientName: `${appointment.patientId.prenom} ${appointment.patientId.nom}`,
    doctorId: appointment.doctorId._id,
    doctorName: `${appointment.doctorId.prenom} ${appointment.doctorId.nom}`,
    dateTime: appointment.dateTime,
    reason: appointment.reason,
    status: appointment.status,
    notes: appointment.notes,
  };

  res.status(200).json({
    success: true,
    message: 'Appointment retrieved successfully',
    data: formatted,
  });
});

export const createAppointment = asyncHandler(async (req, res) => {
  const { patientId, doctorId, dateTime, reason, status = 'pending', notes } = req.body;

  // Validation
  if (!patientId || !doctorId || !dateTime) {
    return res.status(400).json({
      success: false,
      message: 'PatientId, doctorId, and dateTime are required',
    });
  }

  // Verify patient and doctor exist
  const [patient, doctor] = await Promise.all([
    Patient.findById(patientId),
    Doctor.findById(doctorId),
  ]);

  if (!patient || !doctor) {
    return res.status(404).json({
      success: false,
      message: 'Patient or Doctor not found',
    });
  }

  const appointment = await Appointment.create({
    patientId,
    doctorId,
    dateTime,
    reason,
    status,
    notes,
  });

  // Populate and format response
  await appointment.populate('patientId', 'nom prenom email telephone');
  await appointment.populate('doctorId', 'nom prenom email specialite');

  const formatted = {
    id: appointment._id,
    patientId: appointment.patientId._id,
    patientName: `${appointment.patientId.prenom} ${appointment.patientId.nom}`,
    doctorId: appointment.doctorId._id,
    doctorName: `${appointment.doctorId.prenom} ${appointment.doctorId.nom}`,
    dateTime: appointment.dateTime,
    reason: appointment.reason,
    status: appointment.status,
    notes: appointment.notes,
  };

  res.status(201).json({
    success: true,
    message: 'Appointment created successfully',
    data: formatted,
  });
});

export const updateAppointment = asyncHandler(async (req, res) => {
  const { patientId, doctorId, dateTime, reason, status, notes } = req.body;

  const updateData = { patientId, doctorId, dateTime, reason, status, notes };

  // Remove undefined fields
  Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

  const appointment = await Appointment.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('patientId', 'nom prenom email telephone')
    .populate('doctorId', 'nom prenom email specialite');

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found',
    });
  }

  const formatted = {
    id: appointment._id,
    patientId: appointment.patientId._id,
    patientName: `${appointment.patientId.prenom} ${appointment.patientId.nom}`,
    doctorId: appointment.doctorId._id,
    doctorName: `${appointment.doctorId.prenom} ${appointment.doctorId.nom}`,
    dateTime: appointment.dateTime,
    reason: appointment.reason,
    status: appointment.status,
    notes: appointment.notes,
  };

  res.status(200).json({
    success: true,
    message: 'Appointment updated successfully',
    data: formatted,
  });
});

export const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Appointment deleted successfully',
  });
});

export const getAppointmentsByDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const { skip, limit: limitNum } = getPaginationParams(page, limit);

  const [appointments, total] = await Promise.all([
    Appointment.find({ doctorId })
      .populate('patientId', 'nom prenom email telephone')
      .populate('doctorId', 'nom prenom email specialite')
      .sort({ dateTime: 1 })
      .skip(skip)
      .limit(limitNum),
    Appointment.countDocuments({ doctorId }),
  ]);

  const formattedAppointments = appointments.map((apt) => ({
    id: apt._id,
    patientId: apt.patientId._id,
    patientName: `${apt.patientId.prenom} ${apt.patientId.nom}`,
    doctorId: apt.doctorId._id,
    doctorName: `${apt.doctorId.prenom} ${apt.doctorId.nom}`,
    dateTime: apt.dateTime,
    reason: apt.reason,
    status: apt.status,
  }));

  res.status(200).json({
    success: true,
    message: 'Doctor appointments retrieved',
    data: formattedAppointments,
    pagination: {
      total,
      page,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

export const getAppointmentsByPatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const { skip, limit: limitNum } = getPaginationParams(page, limit);

  const [appointments, total] = await Promise.all([
    Appointment.find({ patientId })
      .populate('patientId', 'nom prenom email telephone')
      .populate('doctorId', 'nom prenom email specialite')
      .sort({ dateTime: -1 })
      .skip(skip)
      .limit(limitNum),
    Appointment.countDocuments({ patientId }),
  ]);

  const formattedAppointments = appointments.map((apt) => ({
    id: apt._id,
    patientId: apt.patientId._id,
    patientName: `${apt.patientId.prenom} ${apt.patientId.nom}`,
    doctorId: apt.doctorId._id,
    doctorName: `${apt.doctorId.prenom} ${apt.doctorId.nom}`,
    dateTime: apt.dateTime,
    reason: apt.reason,
    status: apt.status,
  }));

  res.status(200).json({
    success: true,
    message: 'Patient appointments retrieved',
    data: formattedAppointments,
    pagination: {
      total,
      page,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});
