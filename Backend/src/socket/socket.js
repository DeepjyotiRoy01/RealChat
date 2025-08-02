import { socketAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

// Store connected users
const connectedUsers = new Map();

export const setupSocketIO = (io) => {
  // Use authentication middleware
  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.name} (${socket.user._id})`);
    
    // Add user to connected users map
    connectedUsers.set(socket.user._id.toString(), {
      socketId: socket.id,
      user: socket.user
    });

    // Join user's personal room
    socket.join(`user_${socket.user._id}`);

    // Emit user online status to all connected users
    socket.broadcast.emit('user_status_change', {
      userId: socket.user._id,
      isOnline: true,
      lastSeen: socket.user.lastSeen
    });

    // Handle joining chat rooms
    socket.on('join_chat', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        if (chat && chat.isParticipant(socket.user._id)) {
          socket.join(`chat_${chatId}`);
          console.log(`👥 User ${socket.user.name} joined chat ${chatId}`);
          
          // Emit user joined event to chat participants
          socket.to(`chat_${chatId}`).emit('user_joined_chat', {
            chatId,
            user: socket.user.getPublicProfile()
          });
        }
      } catch (error) {
        console.error('Error joining chat:', error);
      }
    });

    // Handle leaving chat rooms
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
      console.log(`👋 User ${socket.user.name} left chat ${chatId}`);
      
      // Emit user left event to chat participants
      socket.to(`chat_${chatId}`).emit('user_left_chat', {
        chatId,
        user: socket.user.getPublicProfile()
      });
    });

    // Handle new message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, type = 'text', replyTo } = data;
        
        // Verify user is participant in chat
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.isParticipant(socket.user._id)) {
          socket.emit('error', { message: 'Not authorized to send message to this chat' });
          return;
        }

        // Create new message
        const messageData = {
          chat: chatId,
          sender: socket.user._id,
          type,
          content: { text: content },
          replyTo
        };

        const message = new Message(messageData);
        await message.save();

        // Populate sender info
        await message.populate('sender', 'name avatar username');

        // Update chat's last message
        chat.lastMessage = {
          text: content,
          sender: socket.user._id,
          timestamp: new Date(),
          type
        };
        await chat.save();

        // Emit message to all participants in the chat
        const messagePayload = {
          ...message.toJSON(),
          sender: socket.user.getPublicProfile()
        };

        io.to(`chat_${chatId}`).emit('new_message', messagePayload);

        // Emit typing stopped
        socket.to(`chat_${chatId}`).emit('typing_stopped', {
          chatId,
          userId: socket.user._id
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing_start', (data) => {
      const { chatId } = data;
      socket.to(`chat_${chatId}`).emit('typing_started', {
        chatId,
        userId: socket.user._id,
        userName: socket.user.name
      });
    });

    socket.on('typing_stop', (data) => {
      const { chatId } = data;
      socket.to(`chat_${chatId}`).emit('typing_stopped', {
        chatId,
        userId: socket.user._id
      });
    });

    // Handle message reactions
    socket.on('add_reaction', async (data) => {
      try {
        const { messageId, emoji } = data;
        
        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Check if user is participant in the chat
        const chat = await Chat.findById(message.chat);
        if (!chat || !chat.isParticipant(socket.user._id)) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        message.addReaction(socket.user._id, emoji);
        await message.save();

        // Emit reaction to all participants
        io.to(`chat_${message.chat}`).emit('reaction_added', {
          messageId,
          userId: socket.user._id,
          userName: socket.user.name,
          emoji
        });

      } catch (error) {
        console.error('Error adding reaction:', error);
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    socket.on('remove_reaction', async (data) => {
      try {
        const { messageId, emoji } = data;
        
        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        message.removeReaction(socket.user._id, emoji);
        await message.save();

        // Emit reaction removal to all participants
        io.to(`chat_${message.chat}`).emit('reaction_removed', {
          messageId,
          userId: socket.user._id,
          emoji
        });

      } catch (error) {
        console.error('Error removing reaction:', error);
        socket.emit('error', { message: 'Failed to remove reaction' });
      }
    });

    // Handle message read receipts
    socket.on('mark_read', async (data) => {
      try {
        const { messageId } = data;
        
        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Check if user is participant in the chat
        const chat = await Chat.findById(message.chat);
        if (!chat || !chat.isParticipant(socket.user._id)) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        message.markAsRead(socket.user._id);
        await message.save();

        // Emit read receipt to message sender
        const senderSocket = connectedUsers.get(message.sender.toString());
        if (senderSocket) {
          io.to(senderSocket.socketId).emit('message_read', {
            messageId,
            readBy: socket.user._id,
            readAt: new Date()
          });
        }

      } catch (error) {
        console.error('Error marking message as read:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    // Handle user status changes
    socket.on('status_change', async (data) => {
      try {
        const { status } = data;
        
        // Update user status
        const user = await User.findById(socket.user._id);
        user.status = status;
        await user.save();

        // Emit status change to all connected users
        socket.broadcast.emit('user_status_change', {
          userId: socket.user._id,
          status,
          lastSeen: user.lastSeen
        });

      } catch (error) {
        console.error('Error updating status:', error);
        socket.emit('error', { message: 'Failed to update status' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${socket.user.name} (${socket.user._id})`);
      
      // Remove user from connected users map
      connectedUsers.delete(socket.user._id.toString());

      // Update user's online status
      try {
        const user = await User.findById(socket.user._id);
        if (user) {
          user.isOnline = false;
          user.lastSeen = new Date();
          await user.save();

          // Emit user offline status to all connected users
          socket.broadcast.emit('user_status_change', {
            userId: socket.user._id,
            isOnline: false,
            lastSeen: user.lastSeen
          });
        }
      } catch (error) {
        console.error('Error updating user status on disconnect:', error);
      }
    });
  });

  // Return connected users map for external use
  return { connectedUsers };
}; 