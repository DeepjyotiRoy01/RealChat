import Chat from '../models/Chat.js';
import User from '../models/User.js';
import Message from '../models/Message.js';

// @desc    Get user's chats
// @route   GET /api/chats
// @access  Private
export const getChats = async (req, res) => {
  try {
    const { type, limit = 20, page = 1 } = req.query;
    
    const query = {
      'participants.user': req.user._id,
      'participants.isActive': true,
      isActive: true
    };

    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const chats = await Chat.find(query)
      .populate('participants.user', 'name username avatar isOnline lastSeen status')
      .populate('lastMessage.sender', 'name username avatar')
      .sort({ 'lastMessage.timestamp': -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Calculate unread counts for each chat
    const chatsWithUnreadCounts = chats.map(chat => {
      const unreadCount = chat.getUnreadCount(req.user._id);
      return {
        ...chat.toJSON(),
        unreadCount
      };
    });

    const total = await Chat.countDocuments(query);

    res.json({
      success: true,
      data: chatsWithUnreadCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting chats'
    });
  }
};

// @desc    Get chat by ID
// @route   GET /api/chats/:id
// @access  Private
export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants.user', 'name username avatar isOnline lastSeen status bio')
      .populate('lastMessage.sender', 'name username avatar')
      .populate('pinnedMessages.message')
      .populate('pinnedMessages.pinnedBy', 'name username');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    if (!chat.isParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat'
      });
    }

    // Mark unread count as 0 for this user
    chat.updateUnreadCount(req.user._id, 0);
    await chat.save();

    const unreadCount = chat.getUnreadCount(req.user._id);

    res.json({
      success: true,
      data: {
        ...chat.toJSON(),
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get chat by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting chat'
    });
  }
};

// @desc    Create direct chat
// @route   POST /api/chats/direct
// @access  Private
export const createDirectChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create chat with yourself'
      });
    }

    // Check if user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if direct chat already exists
    const existingChat = await Chat.findOne({
      type: 'direct',
      'participants.user': { $all: [req.user._id, userId] },
      'participants.1': { $exists: false }
    });

    if (existingChat) {
      return res.json({
        success: true,
        data: existingChat
      });
    }

    // Create new direct chat
    const chat = new Chat({
      type: 'direct',
      participants: [
        { user: req.user._id, role: 'member' },
        { user: userId, role: 'member' }
      ]
    });

    await chat.save();

    // Populate participants
    await chat.populate('participants.user', 'name username avatar isOnline lastSeen status');

    res.status(201).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Create direct chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating direct chat'
    });
  }
};

// @desc    Create group chat
// @route   POST /api/chats/group
// @access  Private
export const createGroupChat = async (req, res) => {
  try {
    const { name, description, participants, isPrivate = false } = req.body;

    if (!name || !participants || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name and participants are required'
      });
    }

    // Add current user as admin
    const allParticipants = [
      { user: req.user._id, role: 'admin' },
      ...participants.map(userId => ({ user: userId, role: 'member' }))
    ];

    const chat = new Chat({
      type: 'group',
      name,
      description,
      participants: allParticipants,
      isPrivate
    });

    await chat.save();

    // Populate participants
    await chat.populate('participants.user', 'name username avatar isOnline lastSeen status');

    res.status(201).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Create group chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating group chat'
    });
  }
};

// @desc    Update chat
// @route   PUT /api/chats/:id
// @access  Private
export const updateChat = async (req, res) => {
  try {
    const { name, description, avatar, isPrivate } = req.body;

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is admin or moderator
    const userRole = chat.getParticipantRole(req.user._id);
    if (!['admin', 'moderator'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this chat'
      });
    }

    if (name) chat.name = name;
    if (description !== undefined) chat.description = description;
    if (avatar !== undefined) chat.avatar = avatar;
    if (isPrivate !== undefined) chat.isPrivate = isPrivate;

    await chat.save();

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Update chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating chat'
    });
  }
};

// @desc    Add participant to group chat
// @route   POST /api/chats/:id/participants
// @access  Private
export const addParticipant = async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (chat.type !== 'group') {
      return res.status(400).json({
        success: false,
        message: 'Can only add participants to group chats'
      });
    }

    // Check if user is admin or moderator
    const userRole = chat.getParticipantRole(req.user._id);
    if (!['admin', 'moderator'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add participants'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already participant
    if (chat.isParticipant(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a participant'
      });
    }

    chat.addParticipant(userId, role);
    await chat.save();

    // Populate new participant
    await chat.populate('participants.user', 'name username avatar isOnline lastSeen status');

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding participant'
    });
  }
};

// @desc    Remove participant from group chat
// @route   DELETE /api/chats/:id/participants/:userId
// @access  Private
export const removeParticipant = async (req, res) => {
  try {
    const { userId } = req.params;

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (chat.type !== 'group') {
      return res.status(400).json({
        success: false,
        message: 'Can only remove participants from group chats'
      });
    }

    // Check if user is admin or moderator
    const userRole = chat.getParticipantRole(req.user._id);
    if (!['admin', 'moderator'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove participants'
      });
    }

    // Cannot remove admin from group
    const participantRole = chat.getParticipantRole(userId);
    if (participantRole === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove admin from group'
      });
    }

    chat.removeParticipant(userId);
    await chat.save();

    res.json({
      success: true,
      message: 'Participant removed successfully'
    });
  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing participant'
    });
  }
};

// @desc    Leave chat
// @route   POST /api/chats/:id/leave
// @access  Private
export const leaveChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (!chat.isParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not a participant in this chat'
      });
    }

    // For direct chats, mark as inactive
    if (chat.type === 'direct') {
      chat.removeParticipant(req.user._id);
      await chat.save();
    } else {
      // For group chats, remove participant
      chat.removeParticipant(req.user._id);
      await chat.save();
    }

    res.json({
      success: true,
      message: 'Left chat successfully'
    });
  } catch (error) {
    console.error('Leave chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error leaving chat'
    });
  }
};

// @desc    Delete chat
// @route   DELETE /api/chats/:id
// @access  Private
export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is admin
    const userRole = chat.getParticipantRole(req.user._id);
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can delete chat'
      });
    }

    // Soft delete chat
    chat.isActive = false;
    await chat.save();

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting chat'
    });
  }
}; 