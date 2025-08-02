import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'video', 'location', 'contact'],
    default: 'text'
  },
  content: {
    text: {
      type: String,
      trim: true,
      maxlength: [5000, 'Message text cannot exceed 5000 characters']
    },
    file: {
      url: String,
      filename: String,
      size: Number,
      mimeType: String
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    contact: {
      name: String,
      phone: String,
      email: String
    }
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  deliveredTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  pinnedAt: Date,
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    clientMessageId: String,
    deviceInfo: {
      platform: String,
      browser: String,
      version: String
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ 'readBy.user': 1 });
messageSchema.index({ 'deliveredTo.user': 1 });
messageSchema.index({ isDeleted: 1 });
messageSchema.index({ isPinned: 1 });

// Compound index for chat messages
messageSchema.index({ 
  chat: 1, 
  createdAt: -1, 
  isDeleted: 1 
});

// Method to mark message as read
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(read => 
    read.user.toString() === userId.toString()
  );
  
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
  }
};

// Method to mark message as delivered
messageSchema.methods.markAsDelivered = function(userId) {
  const existingDelivery = this.deliveredTo.find(delivery => 
    delivery.user.toString() === userId.toString()
  );
  
  if (!existingDelivery) {
    this.deliveredTo.push({
      user: userId,
      deliveredAt: new Date()
    });
  }
};

// Method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  const existingReaction = this.reactions.find(reaction => 
    reaction.user.toString() === userId.toString() && 
    reaction.emoji === emoji
  );
  
  if (!existingReaction) {
    this.reactions.push({
      user: userId,
      emoji,
      createdAt: new Date()
    });
  }
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(userId, emoji) {
  this.reactions = this.reactions.filter(reaction => 
    !(reaction.user.toString() === userId.toString() && reaction.emoji === emoji)
  );
};

// Method to check if user has reacted
messageSchema.methods.hasUserReacted = function(userId, emoji) {
  return this.reactions.some(reaction => 
    reaction.user.toString() === userId.toString() && 
    reaction.emoji === emoji
  );
};

// Method to get reaction count for specific emoji
messageSchema.methods.getReactionCount = function(emoji) {
  return this.reactions.filter(reaction => reaction.emoji === emoji).length;
};

// Method to soft delete message
messageSchema.methods.softDelete = function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
};

// Method to edit message
messageSchema.methods.editMessage = function(newText) {
  this.content.text = newText;
  this.isEdited = true;
  this.editedAt = new Date();
};

// Method to pin message
messageSchema.methods.pinMessage = function(userId) {
  this.isPinned = true;
  this.pinnedAt = new Date();
  this.pinnedBy = userId;
};

// Method to unpin message
messageSchema.methods.unpinMessage = function() {
  this.isPinned = false;
  this.pinnedAt = null;
  this.pinnedBy = null;
};

// Virtual for message status
messageSchema.virtual('status').get(function() {
  if (this.isDeleted) return 'deleted';
  if (this.isEdited) return 'edited';
  return 'sent';
});

// Pre-save middleware to validate content based on type
messageSchema.pre('save', function(next) {
  if (this.type === 'text' && (!this.content.text || this.content.text.trim() === '')) {
    return next(new Error('Text messages must have content'));
  }
  
  if (this.type === 'file' && (!this.content.file || !this.content.file.url)) {
    return next(new Error('File messages must have file content'));
  }
  
  if (this.type === 'location' && (!this.content.location || !this.content.location.latitude)) {
    return next(new Error('Location messages must have location coordinates'));
  }
  
  next();
});

// Ensure virtual fields are serialized
messageSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Add computed fields
    ret.reactionCounts = {};
    if (ret.reactions) {
      ret.reactions.forEach(reaction => {
        ret.reactionCounts[reaction.emoji] = (ret.reactionCounts[reaction.emoji] || 0) + 1;
      });
    }
    return ret;
  }
});

const Message = mongoose.model('Message', messageSchema);

export default Message; 