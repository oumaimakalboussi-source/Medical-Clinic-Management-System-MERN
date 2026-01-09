import Medication from '../models/Medication.js';
import { asyncHandler, getPaginationParams, getSortOptions, buildSearchQuery } from '../utils/helpers.js';

/**
 * Medication Controller
 * Handles medication database management
 */

export const getAllMedications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'name', order = 'asc', search } = req.query;

  const { skip, limit: limitNum } = getPaginationParams(page, limit);
  const sort = getSortOptions(sortBy, order);
  const searchQuery = buildSearchQuery(['name', 'composition', 'manufacturer'], search);

  const [medications, total] = await Promise.all([
    Medication.find(searchQuery).sort(sort).skip(skip).limit(limitNum),
    Medication.countDocuments(searchQuery),
  ]);

  res.status(200).json({
    success: true,
    message: 'Medications retrieved successfully',
    data: medications,
    pagination: {
      total,
      page,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

export const getMedicationById = asyncHandler(async (req, res) => {
  const medication = await Medication.findById(req.params.id);

  if (!medication) {
    return res.status(404).json({
      success: false,
      message: 'Medication not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Medication retrieved successfully',
    data: medication,
  });
});

export const createMedication = asyncHandler(async (req, res) => {
  const { name, description, composition, dosageOptions, sideEffects, contraindications, manufacturer } = req.body;

  // Validation
  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Medication name is required',
    });
  }

  // Check if medication already exists
  const existingMedication = await Medication.findOne({ name });
  if (existingMedication) {
    return res.status(409).json({
      success: false,
      message: 'Medication with this name already exists',
    });
  }

  const medication = await Medication.create({
    name,
    description,
    composition,
    dosageOptions,
    sideEffects,
    contraindications,
    manufacturer,
  });

  res.status(201).json({
    success: true,
    message: 'Medication created successfully',
    data: medication,
  });
});

export const updateMedication = asyncHandler(async (req, res) => {
  const { name, description, composition, dosageOptions, sideEffects, contraindications, manufacturer } = req.body;

  const updateData = { name, description, composition, dosageOptions, sideEffects, contraindications, manufacturer };

  // Remove undefined fields
  Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

  const medication = await Medication.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!medication) {
    return res.status(404).json({
      success: false,
      message: 'Medication not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Medication updated successfully',
    data: medication,
  });
});

export const deleteMedication = asyncHandler(async (req, res) => {
  const medication = await Medication.findByIdAndDelete(req.params.id);

  if (!medication) {
    return res.status(404).json({
      success: false,
      message: 'Medication not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Medication deleted successfully',
  });
});
