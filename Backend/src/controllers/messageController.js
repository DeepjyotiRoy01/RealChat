import Message from '../models/Message.js';
import Chat from '../models/Chat.js';

// @desc    Get messages for a chat
// @route   GET /api/messages/:chatId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, page = 1, before } = req.query;

    // Check if user is participant in chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat'
      });
    }

    const query = {
      chat: chatId,
      isDeleted: false
    };

    // If before parameter is provided, get messages before that timestamp
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find(query)
      .populate('sender', 'name username avatar')
      .populate('replyTo')
      .populate('reactions.user', 'name username avatar')
      .populate('readBy.user', 'name username avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Mark messages as read for this user
    const unreadMessages = messages.filter(msg => 
      !msg.readBy.some(read => read.user._id.toString() === req.user._id.toString())
    );

    for (const message of unreadMessages) {
      message.markAsRead(req.user._id);
      await message.save();
    }

    // Update chat's unread count
    chat.updateUnreadCount(req.user._id, 0);
    await chat.save();

    const total = await Message.countDocuments(query);

    res.json({
      success: true,
      data: messages.reverse(), // Return in chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting messages'
    });
  }
};

// @desc    Send message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { chatId, content, type = 'text', replyTo } = req.body;

    // Check if user is participant in chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send message to this chat'
      });
    }

    // Validate message content
    if (type === 'text' && (!content || content.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Create message
    const messageData = {
      chat: chatId,
      sender: req.user._id,
      type,
      content: { text: content },
      replyTo
    };

    const message = new Message(messageData);
    await message.save();

    // Populate sender and reply info
    await message.populate('sender', 'name username avatar');
    if (replyTo) {
      await message.populate('replyTo');
    }

    // Update chat's last message
    chat.lastMessage = {
      text: content,
      sender: req.user._id,
      timestamp: new Date(),
      type
    };
    await chat.save();

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message'
    });
  }
};

// @desc    Edit message
// @route   PUT /api/messages/:id
// @access  Private
export const editMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const messageId = req.params.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this message'
      });
    }

    // Check if message is not too old (e.g., 15 minutes)
    const timeDiff = Date.now() - message.createdAt.getTime();
    const maxEditTime = 15 * 60 * 1000; // 15 minutes

    if (timeDiff > maxEditTime) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be edited after 15 minutes'
      });
    }

    // Edit message
    message.editMessage(content);
    await message.save();

    // Populate sender info
    await message.populate('sender', 'name username avatar');

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error editing message'
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender or admin/moderator
    const chat = await Chat.findById(message.chat);
    const userRole = chat.getParticipantRole(req.user._id);
    const isAuthorized = message.sender.toString() === req.user._id.toString() || 
                        ['admin', 'moderator'].includes(userRole);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    // Soft delete message
    message.softDelete(req.user._id);
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting message'
    });
  }
};

// @desc    Add reaction to message
// @route   POST /api/messages/:id/reactions
// @access  Private
export const addReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    const messageId = req.params.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is participant in chat
    const chat = await Chat.findById(message.chat);
    if (!chat || !chat.isParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to react to this message'
      });
    }

    // Add reaction
    message.addReaction(req.user._id, emoji);
    await message.save();

    // Populate reaction user info
    await message.populate('reactions.user', 'name username avatar');

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding reaction'
    });
  }
};

// @desc    Remove reaction from message
// @route   DELETE /api/messages/:id/reactions/:emoji
// @access  Private
export const removeReaction = async (req, res) => {
  try {
    const { emoji } = req.params;
    const messageId = req.params.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Remove reaction
    message.removeReaction(req.user._id, emoji);
    await message.save();

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing reaction'
    });
  }
};

// @desc    Mark message as read
// @route   POST /api/messages/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const messageId = req.params.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is participant in chat
    const chat = await Chat.findById(message.chat);
    if (!chat || !chat.isParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read'
      });
    }

    // Mark as read
    message.markAsRead(req.user._id);
    await message.save();

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking message as read'
    });
  }
};

// @desc    Search messages
// @route   GET /api/messages/search/:chatId
// @access  Private
export const searchMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { q, limit = 20, page = 1 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Check if user is participant in chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to search in this chat'
      });
    }

    const query = {
      chat: chatId,
      isDeleted: false,
      'content.text': { $regex: q, $options: 'i' }
    };

    const skip = (page - 1) * limit;

    const messages = await Message.find(query)
      .populate('sender', 'name username avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Message.countDocuments(query);

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching messages'
    });
  }
}; 