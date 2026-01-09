import Doctor from '../models/Doctor.js';
import { asyncHandler, getPaginationParams, getSortOptions, buildSearchQuery } from '../utils/helpers.js';

/**
 * Doctor Controller
 * Handles doctor profile management
 */

export const getAllDoctors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'asc', search } = req.query;

  const { skip, limit: limitNum } = getPaginationParams(page, limit);
  const sort = getSortOptions(sortBy, order);
  const searchQuery = buildSearchQuery(['nom', 'prenom', 'email', 'specialite'], search);

  const [doctors, total] = await Promise.all([
    Doctor.find(searchQuery).sort(sort).skip(skip).limit(limitNum),
    Doctor.countDocuments(searchQuery),
  ]);

  res.status(200).json({
    success: true,
    message: 'Doctors retrieved successfully',
    data: doctors,
    pagination: {
      total,
      page,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

export const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate('userId', 'email nom prenom role status');

  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Doctor retrieved successfully',
    data: doctor,
  });
});

export const createDoctor = asyncHandler(async (req, res) => {
  const {
    email,
    nom,
    prenom,
    specialite,
    numeroOrdre,
    telephone,
    cabinet,
    horairesConsultation,
  } = req.body;

  // Validation
  if (!email || !nom || !prenom) {
    return res.status(400).json({
      success: false,
      message: 'Email, nom, and prenom are required',
    });
  }

  // Check if doctor email already exists
  const existingDoctor = await Doctor.findOne({ email });
  if (existingDoctor) {
    return res.status(409).json({
      success: false,
      message: 'Doctor with this email already exists',
    });
  }

  const doctor = await Doctor.create({
    email,
    nom,
    prenom,
    specialite,
    numeroOrdre,
    telephone,
    cabinet,
    horairesConsultation,
  });

  res.status(201).json({
    success: true,
    message: 'Doctor created successfully',
    data: doctor,
  });
});

export const updateDoctor = asyncHandler(async (req, res) => {
  const {
    email,
    nom,
    prenom,
    specialite,
    numeroOrdre,
    telephone,
    cabinet,
    horairesConsultation,
  } = req.body;

  const updateData = {
    email,
    nom,
    prenom,
    specialite,
    numeroOrdre,
    telephone,
    cabinet,
    horairesConsultation,
  };

  // Remove undefined fields
  Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

  const doctor = await Doctor.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Doctor updated successfully',
    data: doctor,
  });
});

export const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);

  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Doctor deleted successfully',
  });
});
