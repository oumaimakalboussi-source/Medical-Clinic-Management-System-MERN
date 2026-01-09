import Secretary from '../models/Secretary.js';
import { asyncHandler, getPaginationParams, getSortOptions, buildSearchQuery } from '../utils/helpers.js';

/**
 * Secretary Controller
 * Handles secretary profile management
 */

export const getAllSecretaries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'asc', search } = req.query;

  const { skip, limit: limitNum } = getPaginationParams(page, limit);
  const sort = getSortOptions(sortBy, order);
  const searchQuery = buildSearchQuery(['nom', 'prenom', 'email'], search);

  const [secretaries, total] = await Promise.all([
    Secretary.find(searchQuery).sort(sort).skip(skip).limit(limitNum),
    Secretary.countDocuments(searchQuery),
  ]);

  res.status(200).json({
    success: true,
    message: 'Secretaries retrieved successfully',
    data: secretaries,
    pagination: {
      total,
      page,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

export const getSecretaryById = asyncHandler(async (req, res) => {
  const secretary = await Secretary.findById(req.params.id).populate('userId', 'email nom prenom role status');

  if (!secretary) {
    return res.status(404).json({
      success: false,
      message: 'Secretary not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Secretary retrieved successfully',
    data: secretary,
  });
});

export const createSecretary = asyncHandler(async (req, res) => {
  const { email, nom, prenom, telephone, departement } = req.body;

  // Validation
  if (!email || !nom || !prenom) {
    return res.status(400).json({
      success: false,
      message: 'Email, nom, and prenom are required',
    });
  }

  // Check if secretary email already exists
  const existingSecretary = await Secretary.findOne({ email });
  if (existingSecretary) {
    return res.status(409).json({
      success: false,
      message: 'Secretary with this email already exists',
    });
  }

  const secretary = await Secretary.create({
    email,
    nom,
    prenom,
    telephone,
    departement,
  });

  res.status(201).json({
    success: true,
    message: 'Secretary created successfully',
    data: secretary,
  });
});

export const updateSecretary = asyncHandler(async (req, res) => {
  const { email, nom, prenom, telephone, departement } = req.body;

  const updateData = { email, nom, prenom, telephone, departement };

  // Remove undefined fields
  Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

  const secretary = await Secretary.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!secretary) {
    return res.status(404).json({
      success: false,
      message: 'Secretary not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Secretary updated successfully',
    data: secretary,
  });
});

export const deleteSecretary = asyncHandler(async (req, res) => {
  const secretary = await Secretary.findByIdAndDelete(req.params.id);

  if (!secretary) {
    return res.status(404).json({
      success: false,
      message: 'Secretary not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Secretary deleted successfully',
  });
});
