import express from 'express';
import { login, logout, register, refreshToken } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * Authentication Routes
 */

router.post('/login', login);
router.post('/logout', authenticate, logout);
router.post('/refresh', authenticate, refreshToken);
router.post('/register', register);

export default router;
