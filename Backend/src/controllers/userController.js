import User from '../models/User.js';
import UserRequest from '../models/UserRequest.js';
import { validationResult } from 'express-validator';

// @desc    Get user contacts
// @route   GET /api/users/contacts
// @access  Private
export const getContacts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('contacts.user', 'name avatar phoneNumber isOnline lastSeen');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const contacts = user.contacts.map(contact => ({
      id: contact.user._id,
      name: contact.name || contact.user.name,
      avatar: contact.user.avatar,
      phoneNumber: contact.phoneNumber || contact.user.phoneNumber,
      isOnline: contact.user.isOnline,
      lastSeen: contact.user.lastSeen
    }));

    res.status(200).json({
      contacts
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add contact
// @route   POST /api/users/contacts
// @access  Private
export const addContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { phoneNumber, name } = req.body;

    // Check if contact already exists
    const existingContact = await User.findById(req.user.id);
    const contactExists = existingContact.contacts.some(
      contact => contact.phoneNumber === phoneNumber
    );

    if (contactExists) {
      return res.status(400).json({ message: 'Contact already exists' });
    }

    // Find user by phone number
    const contactUser = await User.findOne({ phoneNumber });
    
    if (!contactUser) {
      return res.status(404).json({ message: 'User not found with this phone number' });
    }

    // Add to contacts
    existingContact.contacts.push({
      user: contactUser._id,
      name: name || contactUser.name,
      phoneNumber: contactUser.phoneNumber
    });

    await existingContact.save();

    res.status(200).json({
      message: 'Contact added successfully',
      contact: {
        id: contactUser._id,
        name: name || contactUser.name,
        avatar: contactUser.avatar,
        phoneNumber: contactUser.phoneNumber,
        isOnline: contactUser.isOnline,
        lastSeen: contactUser.lastSeen
      }
    });

  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove contact
// @route   DELETE /api/users/contacts/:contactId
// @access  Private
export const removeContact = async (req, res) => {
  try {
    const { contactId } = req.params;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.contacts = user.contacts.filter(
      contact => contact.user.toString() !== contactId
    );

    await user.save();

    res.status(200).json({
      message: 'Contact removed successfully'
    });

  } catch (error) {
    console.error('Remove contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user requests (Admin only)
// @route   GET /api/users/requests
// @access  Private (Admin)
export const getUserRequests = async (req, res) => {
  try {
    const requests = await UserRequest.find({ status: 'pending' })
      .sort({ createdAt: -1 });

    res.status(200).json({
      requests
    });

  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve user request (Admin only)
// @route   POST /api/users/requests/:requestId/approve
// @access  Private (Admin)
export const approveUserRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const userRequest = await UserRequest.findById(requestId);
    
    if (!userRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (userRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    // Create new user
    const newUser = new User({
      name: userRequest.name,
      phoneNumber: userRequest.phoneNumber,
      isVerified: true
    });

    await newUser.save();

    // Approve the request
    userRequest.approve(req.user.id);
    await userRequest.save();

    res.status(200).json({
      message: 'User request approved successfully',
      user: newUser.getPublicProfile()
    });

  } catch (error) {
    console.error('Approve user request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject user request (Admin only)
// @route   POST /api/users/requests/:requestId/reject
// @access  Private (Admin)
export const rejectUserRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;

    const userRequest = await UserRequest.findById(requestId);
    
    if (!userRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (userRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    // Reject the request
    userRequest.reject(req.user.id, reason);
    await userRequest.save();

    res.status(200).json({
      message: 'User request rejected successfully'
    });

  } catch (error) {
    console.error('Reject user request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users/all
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('name avatar phoneNumber isOnline lastSeen isAdmin createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      users
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { phoneNumber: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.user.id }
    })
    .select('name avatar phoneNumber isOnline lastSeen')
    .limit(10);

    res.status(200).json({
      users
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get online users
// @route   GET /api/users/online
// @access  Private
export const getOnlineUsers = async (req, res) => {
  try {
    const users = await User.find({ isOnline: true })
      .select('name avatar phoneNumber lastSeen')
      .sort({ lastSeen: -1 });

    res.status(200).json({
      users
    });

  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 