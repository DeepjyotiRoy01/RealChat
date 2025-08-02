import express from 'express';
import {
  getContacts,
  addContact,
  removeContact,
  getUserRequests,
  approveUserRequest,
  rejectUserRequest,
  getAllUsers,
  searchUsers,
  getOnlineUsers
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateAddContact = [
  body('phoneNumber').matches(/^[0-9]{10,15}$/).withMessage('Please enter a valid phone number'),
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
];

// All routes require authentication
router.use(protect);

// Contact management
router.get('/contacts', getContacts);
router.post('/contacts', validateAddContact, addContact);
router.delete('/contacts/:contactId', removeContact);

// User search
router.get('/search', searchUsers);
router.get('/online', getOnlineUsers);

// Admin only routes
router.get('/requests', admin, getUserRequests);
router.post('/requests/:requestId/approve', admin, approveUserRequest);
router.post('/requests/:requestId/reject', admin, rejectUserRequest);
router.get('/all', admin, getAllUsers);

export default router; 