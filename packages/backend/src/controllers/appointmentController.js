import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { asyncHandler, getPaginationParams, getSortOptions } from '../utils/helpers.js';

/**
 * Appointment Controller
 * Handles appointment/rendez-vous management with role-based access control
 * 
 * Access Rules:
 * - PATIENTS: Can create (only for themselves, status=pending), view (only theirs), cannot edit/delete
 * - ADMIN/SECRETARY: Full CRUD access with all patients' appointments
 * - DOCTOR: Can view all appointments and their own scheduled appointments
 */

export const getAllAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'dateTime', order = 'asc', status } = req.query;
  const requestingUser = req.user;

  const { skip, limit: limitNum } = getPaginationParams(page, limit);
  const sort = getSortOptions(sortBy, order);

  // Build query based on user role
  const query = {};
  
  // Patients can only view their own appointments
  if (requestingUser.role === 'patient') {
    try {
      const patientRecord = await Patient.findOne({ userId: requestingUser._id });
      if (!patientRecord) {
        return res.status(404).json({
          success: false,
          message: 'Patient profile not found',
        });
      }
      query.patientId = patientRecord._id;
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving patient information',
      });
    }
  }
  // Doctors can view all appointments
  // Admin/Secretary can view all appointments

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

  // Patients can only view their own appointments
  if (req.user.role === 'patient') {
    try {
      const patientRecord = await Patient.findOne({ userId: req.user._id });
      if (!patientRecord || patientRecord._id.toString() !== appointment.patientId._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this appointment',
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error verifying appointment access',
      });
    }
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
  const requestingUser = req.user;

  // Input validation
  if (!patientId || !doctorId || !dateTime) {
    return res.status(400).json({
      success: false,
      message: 'PatientId, doctorId, and dateTime are required',
    });
  }

  // ========== PATIENT ROLE RESTRICTIONS ==========
  if (requestingUser.role === 'patient') {
    // 1. Verify patient exists and belongs to requesting user
    let patientRecord;
    try {
      patientRecord = await Patient.findOne({ userId: requestingUser._id });
      if (!patientRecord) {
        return res.status(404).json({
          success: false,
          message: 'Patient profile not found for your user account',
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving patient information',
      });
    }

    // 2. Enforce: Patients can only book for themselves
    if (patientRecord._id.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Patients can only create appointments for themselves',
      });
    }

    // 3. Enforce: Patient appointments are always 'pending' status
    if (status && status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Patient appointments must have status "pending". Admin/Secretary can change status after creation.',
      });
    }
  }

  // ========== VERIFY RELATED RECORDS ==========
  // Verify patient and doctor exist
  const [patient, doctor] = await Promise.all([
    Patient.findById(patientId),
    Doctor.findById(doctorId),
  ]);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: `Patient with ID ${patientId} not found`,
    });
  }

  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: `Doctor with ID ${doctorId} not found`,
    });
  }

  // ========== DETERMINE STATUS ==========
  // Patients: always 'pending'
  // Admin/Secretary: can set any valid status, default 'pending'
  const appointmentStatus = requestingUser.role === 'patient' 
    ? 'pending' 
    : (status || 'pending');

  // ========== CREATE APPOINTMENT ==========
  const appointment = await Appointment.create({
    patientId,
    doctorId,
    dateTime,
    reason: reason || '',
    status: appointmentStatus,
    notes: notes || '',
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
  const requestingUser = req.user;
  const appointmentId = req.params.id;

  // ========== PATIENT ROLE RESTRICTIONS ==========
  // Patients CANNOT update any appointments
  if (requestingUser.role === 'patient') {
    return res.status(403).json({
      success: false,
      message: 'Patients cannot modify appointments. Please contact clinic support.',
    });
  }

  // ========== ADMIN/SECRETARY ONLY ==========
  // Validate appointment exists
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: `Appointment with ID ${appointmentId} not found`,
    });
  }

  // Validate related records if being updated
  if (patientId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: `Patient with ID ${patientId} not found`,
      });
    }
  }

  if (doctorId) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: `Doctor with ID ${doctorId} not found`,
      });
    }
  }

  // Build update object (only include provided fields)
  const updateData = {};
  if (patientId !== undefined) updateData.patientId = patientId;
  if (doctorId !== undefined) updateData.doctorId = doctorId;
  if (dateTime !== undefined) updateData.dateTime = dateTime;
  if (reason !== undefined) updateData.reason = reason;
  if (status !== undefined) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;

  // Perform update with validation
  const updatedAppointment = await Appointment.findByIdAndUpdate(
    appointmentId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate('patientId', 'nom prenom email telephone')
    .populate('doctorId', 'nom prenom email specialite');

  const formatted = {
    id: updatedAppointment._id,
    patientId: updatedAppointment.patientId._id,
    patientName: `${updatedAppointment.patientId.prenom} ${updatedAppointment.patientId.nom}`,
    doctorId: updatedAppointment.doctorId._id,
    doctorName: `${updatedAppointment.doctorId.prenom} ${updatedAppointment.doctorId.nom}`,
    dateTime: updatedAppointment.dateTime,
    reason: updatedAppointment.reason,
    status: updatedAppointment.status,
    notes: updatedAppointment.notes,
  };

  res.status(200).json({
    success: true,
    message: 'Appointment updated successfully',
    data: formatted,
  });
});

export const deleteAppointment = asyncHandler(async (req, res) => {
  const requestingUser = req.user;
  const appointmentId = req.params.id;

  // ========== PATIENT ROLE RESTRICTIONS ==========
  // Patients CANNOT delete any appointments
  if (requestingUser.role === 'patient') {
    return res.status(403).json({
      success: false,
      message: 'Patients cannot delete appointments. Please contact clinic support.',
    });
  }

  // ========== ADMIN/SECRETARY ONLY ==========
  const appointment = await Appointment.findByIdAndDelete(appointmentId);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: `Appointment with ID ${appointmentId} not found`,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Appointment deleted successfully',
    data: {
      id: appointment._id,
    },
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
