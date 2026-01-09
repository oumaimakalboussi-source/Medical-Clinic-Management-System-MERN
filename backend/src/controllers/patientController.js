import Patient from '../models/Patient.js';
import { asyncHandler, getPaginationParams, getSortOptions, buildSearchQuery } from '../utils/helpers.js';

/**
 * Patient Controller
 * Handles patient profile management
 */

export const getAllPatients = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'asc', search } = req.query;

  const { skip, limit: limitNum } = getPaginationParams(page, limit);
  const sort = getSortOptions(sortBy, order);
  const searchQuery = buildSearchQuery(['nom', 'prenom', 'email', 'telephone'], search);

  const [patients, total] = await Promise.all([
    Patient.find(searchQuery).sort(sort).skip(skip).limit(limitNum),
    Patient.countDocuments(searchQuery),
  ]);

  res.status(200).json({
    success: true,
    message: 'Patients retrieved successfully',
    data: patients,
    pagination: {
      total,
      page,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

export const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate('userId', 'email nom prenom role status');

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Patient retrieved successfully',
    data: patient,
  });
});

export const createPatient = asyncHandler(async (req, res) => {
  const {
    email,
    nom,
    prenom,
    dateNaissance,
    sexe,
    telephone,
    adresse,
    numeroSecu,
    mutuelle,
    allergies,
    antecedents,
  } = req.body;

  // Validation
  if (!email || !nom || !prenom) {
    return res.status(400).json({
      success: false,
      message: 'Email, nom, and prenom are required',
    });
  }

  // Check if patient email already exists
  const existingPatient = await Patient.findOne({ email });
  if (existingPatient) {
    return res.status(409).json({
      success: false,
      message: 'Patient with this email already exists',
    });
  }

  const patient = await Patient.create({
    email,
    nom,
    prenom,
    dateNaissance,
    sexe,
    telephone,
    adresse,
    numeroSecu,
    mutuelle,
    allergies,
    antecedents,
  });

  res.status(201).json({
    success: true,
    message: 'Patient created successfully',
    data: patient,
  });
});

export const updatePatient = asyncHandler(async (req, res) => {
  const {
    email,
    nom,
    prenom,
    dateNaissance,
    sexe,
    telephone,
    adresse,
    numeroSecu,
    mutuelle,
    allergies,
    antecedents,
  } = req.body;

  const updateData = {
    email,
    nom,
    prenom,
    dateNaissance,
    sexe,
    telephone,
    adresse,
    numeroSecu,
    mutuelle,
    allergies,
    antecedents,
  };

  // Remove undefined fields
  Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

  const patient = await Patient.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Patient updated successfully',
    data: patient,
  });
});

export const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Patient deleted successfully',
  });
});

export const searchPatients = asyncHandler(async (req, res) => {
  const { q = '' } = req.query;

  if (!q || q.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters',
    });
  }

  const searchRegex = new RegExp(q, 'i');
  const patients = await Patient.find({
    $or: [
      { nom: searchRegex },
      { prenom: searchRegex },
      { email: searchRegex },
      { telephone: searchRegex },
    ],
  }).limit(20);

  res.status(200).json({
    success: true,
    message: 'Search results',
    data: patients,
  });
});
