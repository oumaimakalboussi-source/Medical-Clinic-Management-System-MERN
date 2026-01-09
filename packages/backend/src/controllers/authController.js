import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Secretary from '../models/Secretary.js';
import { generateToken } from '../config/jwt.js';
import { asyncHandler } from '../utils/helpers.js';

/**
 * Authentication Controller
 * Handles login, logout, and token refresh
 */

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  // Find user with password field included
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  // Check password
  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  // Check user status
  if (user.status !== 'active') {
    return res.status(403).json({
      success: false,
      message: 'Your account is inactive',
    });
  }

  // Generate token
  const token = generateToken(user._id, user.role);

  // Prepare user response (exclude password)
  const userResponse = {
    id: user._id,
    email: user.email,
    nom: user.nom,
    prenom: user.prenom,
    role: user.role,
    telephone: user.telephone,
    avatar: user.avatar,
  };

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: userResponse,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  // JWT is stateless, so logout is handled on client side
  // This endpoint can be used for logging purposes or token blacklisting if needed

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  const newToken = generateToken(req.user._id, req.user.role);

  res.status(200).json({
    success: true,
    message: 'Token refreshed',
    data: {
      token: newToken,
    },
  });
});

export const register = asyncHandler(async (req, res) => {
  const { email, password, nom, prenom, role = 'patient' } = req.body;

  // Validation
  if (!email || !password || !nom || !prenom) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, nom, and prenom are required',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
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

  // Create user
  const user = await User.create({
    email,
    password,
    nom,
    prenom,
    role,
    status: 'active',
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

  // Generate token
  const token = generateToken(user._id, user.role);

  const userResponse = {
    id: user._id,
    email: user.email,
    nom: user.nom,
    prenom: user.prenom,
    role: user.role,
    telephone: user.telephone,
  };

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      token,
      user: userResponse,
    },
  });
});
