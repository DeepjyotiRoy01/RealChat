import express from 'express';
import {
  sendOTP,
  verifyOTP,
  register,
  login,
  getMe,
  updateProfile,
  updateSettings,
  changePassword,
  logout
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateSendOTP = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('phoneNumber').matches(/^[0-9]{10,15}$/).withMessage('Please enter a valid phone number')
];

const validateVerifyOTP = [
  body('phoneNumber').matches(/^[0-9]{10,15}$/).withMessage('Please enter a valid phone number'),
  body('otp').isLength({ min: 4, max: 4 }).withMessage('OTP must be 4 digits')
];

const validateRegister = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('phoneNumber').matches(/^[0-9]{10,15}$/).withMessage('Please enter a valid phone number'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateLogin = [
  body('phoneNumber').matches(/^[0-9]{10,15}$/).withMessage('Please enter a valid phone number'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Public routes
router.post('/send-otp', validateSendOTP, sendOTP);
router.post('/verify-otp', validateVerifyOTP, verifyOTP);
router.post('/login', validateLogin, login);

// Protected routes (Admin only)
router.post('/register', protect, admin, validateRegister, register);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/settings', protect, updateSettings);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

export default router; 