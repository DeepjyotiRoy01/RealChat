import express from 'express';
import {
  getChats,
  getChatById,
  createDirectChat,
  createGroupChat,
  updateChat,
  addParticipant,
  removeParticipant,
  leaveChat,
  deleteChat
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Chat management
router.get('/', getChats);
router.get('/:id', getChatById);
router.post('/direct', createDirectChat);
router.post('/group', createGroupChat);
router.put('/:id', updateChat);
router.delete('/:id', deleteChat);

// Participant management
router.post('/:id/participants', addParticipant);
router.delete('/:id/participants/:userId', removeParticipant);

// Chat actions
router.post('/:id/leave', leaveChat);

export default router; 