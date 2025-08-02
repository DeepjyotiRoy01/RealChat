import express from 'express';
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  markAsRead,
  searchMessages
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Message management
router.get('/:chatId', getMessages);
router.post('/', sendMessage);
router.put('/:id', editMessage);
router.delete('/:id', deleteMessage);

// Message actions
router.post('/:id/reactions', addReaction);
router.delete('/:id/reactions/:emoji', removeReaction);
router.post('/:id/read', markAsRead);

// Message search
router.get('/search/:chatId', searchMessages);

export default router; 