import jwt from 'jsonwebtoken';

/**
 * JWT Configuration
 * Handles token generation and verification
 */

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'your_secret_key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
  } catch (error) {
    throw new Error('Invalid token');
  }
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

export { generateToken, verifyToken, decodeToken };
