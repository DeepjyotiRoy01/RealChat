import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['direct', 'group'],
    required: true
  },
  name: {
    type: String,
    required: function() {
      return this.type === 'group';
    },
    trim: true,
    maxlength: [50, 'Chat name cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters'],
    default: ''
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  lastMessage: {
    text: {
      type: String,
      default: ''
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'audio', 'video'],
      default: 'text'
    }
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: ''
  },
  pinnedMessages: [{
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    pinnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    pinnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowVoiceMessages: {
      type: Boolean,
      default: true
    },
    allowReactions: {
      type: Boolean,
      default: true
    },
    slowMode: {
      type: Boolean,
      default: false
    },
    slowModeInterval: {
      type: Number,
      default: 0 // seconds
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ type: 1 });
chatSchema.index({ 'lastMessage.timestamp': -1 });
chatSchema.index({ isActive: 1 });

// Compound index for direct chats
chatSchema.index({ 
  type: 1, 
  'participants.user': 1 
});

// Method to check if user is participant
chatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(participant => 
    participant.user.toString() === userId.toString() && participant.isActive
  );
};

// Method to get participant role
chatSchema.methods.getParticipantRole = function(userId) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  return participant ? participant.role : null;
};

// Method to add participant
chatSchema.methods.addParticipant = function(userId, role = 'member') {
  if (!this.isParticipant(userId)) {
    this.participants.push({
      user: userId,
      role,
      joinedAt: new Date(),
      isActive: true
    });
  }
};

// Method to remove participant
chatSchema.methods.removeParticipant = function(userId) {
  const participantIndex = this.participants.findIndex(p => 
    p.user.toString() === userId.toString()
  );
  
  if (participantIndex !== -1) {
    this.participants[participantIndex].isActive = false;
  }
};

// Method to update unread count
chatSchema.methods.updateUnreadCount = function(userId, count = 0) {
  this.unreadCount.set(userId.toString(), count);
};

// Method to get unread count for user
chatSchema.methods.getUnreadCount = function(userId) {
  return this.unreadCount.get(userId.toString()) || 0;
};

// Static method to find or create direct chat
chatSchema.statics.findOrCreateDirectChat = async function(user1Id, user2Id) {
  // Check if direct chat already exists
  const existingChat = await this.findOne({
    type: 'direct',
    'participants.user': { $all: [user1Id, user2Id] },
    'participants.1': { $exists: false } // Ensure only 2 participants
  });

  if (existingChat) {
    return existingChat;
  }

  // Create new direct chat
  const newChat = new this({
    type: 'direct',
    participants: [
      { user: user1Id, role: 'member' },
      { user: user2Id, role: 'member' }
    ]
  });

  return await newChat.save();
};

// Pre-save middleware to ensure direct chats have exactly 2 participants
chatSchema.pre('save', function(next) {
  if (this.type === 'direct' && this.participants.length !== 2) {
    return next(new Error('Direct chats must have exactly 2 participants'));
  }
  next();
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat; 