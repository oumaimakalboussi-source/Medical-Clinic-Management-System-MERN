import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Secretary from '../models/Secretary.js';
import { asyncHandler, getPaginationParams, getSortOptions, buildSearchQuery } from '../utils/helpers.js';

/**
 * User Controller
 * Admin-only endpoint for managing all users
 */

export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'asc' } = req.query;

  const { skip, limit: limitNum } = getPaginationParams(page, limit);
  const sort = getSortOptions(sortBy, order);

  const [users, total] = await Promise.all([
    User.find().select('-password').sort(sort).skip(skip).limit(limitNum),
    User.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: users,
    pagination: {
      total,
      page,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: user,
  });
});

export const createUser = asyncHandler(async (req, res) => {
  const { email, password, nom, prenom, role = 'patient', telephone, status = 'active' } = req.body;

  // Validation
  if (!email || !password || !nom || !prenom) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, nom, and prenom are required',
    });
  }

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'Email already registered',
    });
  }

  const user = await User.create({
    email,
    password,
    nom,
    prenom,
    role,
    telephone,
    status,
  });

  // Create role-specific profile
  if (role === 'patient') {
    await Patient.create({
      userId: user._id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
    });
  } else if (role === 'doctor') {
    await Doctor.create({
      userId: user._id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
    });
  } else if (role === 'secretary') {
    await Secretary.create({
      userId: user._id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
    });
  }

  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: userResponse,
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { email, nom, prenom, role, telephone, status } = req.body;

  // Cannot change email
  if (email && email !== (await User.findById(req.params.id))?.email) {
    return res.status(400).json({
      success: false,
      message: 'Cannot change email address',
    });
  }

  const updateData = { nom, prenom, role, telephone, status };
  Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

  const user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Delete role-specific profile
  if (user.role === 'patient') {
    await Patient.deleteOne({ userId: user._id });
  } else if (user.role === 'doctor') {
    await Doctor.deleteOne({ userId: user._id });
  } else if (user.role === 'secretary') {
    await Secretary.deleteOne({ userId: user._id });
  }

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});
