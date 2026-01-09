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
  const { patientId, doctorId, dateTime, reason, status, notes } = req.body;
  const requestingUser = req.user; // From auth middleware

  // Validation
  if (!patientId || !doctorId || !dateTime) {
    return res.status(400).json({
      success: false,
      message: 'PatientId, doctorId, and dateTime are required',
    });
  }

  // If patient role: enforce restrictions
  if (requestingUser.role === 'patient') {
    // Patient can only book for themselves (via their associated patient ID)
    const patientUser = await Patient.findOne({ userId: requestingUser._id });
    if (!patientUser || patientUser._id.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Patients can only book appointments for themselves',
      });
    }
    // Enforce status is always 'pending' for patient-created appointments
    if (status && status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Patient appointments must have status "pending"',
      });
    }
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

  // Determine status: patient appointments always 'pending', others can override
  const appointmentStatus = requestingUser.role === 'patient' ? 'pending' : (status || 'pending');

  const appointment = await Appointment.create({
    patientId,
    doctorId,
    dateTime,
    reason,
    status: appointmentStatus,
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
  const requestingUser = req.user; // From auth middleware

  // If patient role: prevent modifications
  if (requestingUser.role === 'patient') {
    return res.status(403).json({
      success: false,
      message: 'Patients cannot modify appointments. Please contact support.',
    });
  }

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
  const requestingUser = req.user; // From auth middleware

  // Patients cannot delete appointments
  if (requestingUser.role === 'patient') {
    return res.status(403).json({
      success: false,
      message: 'Patients cannot delete appointments',
    });
  }

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
