const socketIo = require('socket.io');

// Store active connections
const activeUsers = new Map();
const groupRooms = new Map();

function createSocketServer(server) {
  const io = socketIo(server, {
    cors: {
      origin: [
        'http://localhost:8081',
        'http://localhost:8082',
        'http://localhost:8083',
        'exp://192.168.1.32:8081',
        'exp://localhost:8081',
        'https://yourfrontenddomain.com',
      ],
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io',
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log('🔌 [SOCKET.IO] User connected:', socket.id);

    // Handle user authentication
    socket.on('authenticate', async (data) => {
      try {
        const { userId, token } = data;
        console.log('🔐 [SOCKET.IO] Authentication attempt for user:', userId);
        
        // TODO: Verify JWT token here
        // const user = await verifyToken(token);
        
        activeUsers.set(userId, {
          socketId: socket.id,
          userId: userId,
          connectedAt: new Date()
        });
        
        socket.userId = userId;
        console.log(`✅ [SOCKET.IO] User ${userId} authenticated`);
        
        await joinUserGroups(socket, userId);
        socket.emit('authenticated', { success: true, userId });
        
      } catch (error) {
        console.error('❌ [SOCKET.IO] Authentication failed:', error);
        socket.emit('auth_error', { message: 'Authentication failed' });
      }
    });

    // Handle joining groups
    socket.on('join_group', async (data) => {
      try {
        const { groupId } = data;
        const userId = socket.userId;
        
        if (!userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        console.log(`👥 [SOCKET.IO] User ${userId} joining group ${groupId}`);

        const Group = require('../models/group');
        const group = await Group.findById(groupId);
        
        if (!group || !group.isMember(userId)) {
          socket.emit('error', { message: 'Not authorized to join this group' });
          return;
        }

        socket.join(`group_${groupId}`);
        
        if (!groupRooms.has(groupId)) {
          groupRooms.set(groupId, new Set());
        }
        groupRooms.get(groupId).add(userId);
        
        socket.to(`group_${groupId}`).emit('user_joined', {
          userId: userId,
          groupId: groupId,
          timestamp: new Date()
        });
        
        socket.emit('group_joined', { groupId, success: true });
        
      } catch (error) {
        console.error('❌ [SOCKET.IO] Error joining group:', error);
        socket.emit('error', { message: 'Failed to join group' });
      }
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { groupId, content, replyTo } = data;
        const userId = socket.userId;
        
        if (!userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        console.log(`📨 [SOCKET.IO] User ${userId} sending message to group ${groupId}`);

        const Group = require('../models/group');
        const group = await Group.findById(groupId);
        
        if (!group || !group.isMember(userId)) {
          socket.emit('error', { message: 'Not authorized to send message' });
          return;
        }

        const GroupMessage = require('../models/groupMessage');
        const message = new GroupMessage({
          groupId: groupId,
          sender: userId,
          content: {
            text: content.text,
            type: content.type || 'text'
          },
          replyTo: replyTo || null
        });

        await message.save();
        await message.populate('sender', 'name email username profilePicture');
        if (replyTo) {
          await message.populate('replyTo', 'content.text sender');
        }

        io.to(`group_${groupId}`).emit('new_message', {
          message: message,
          groupId: groupId,
          timestamp: new Date()
        });

        console.log(`✅ [SOCKET.IO] Message sent successfully`);
        
      } catch (error) {
        console.error('❌ [SOCKET.IO] Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { groupId } = data;
      socket.to(`group_${groupId}`).emit('user_typing', {
        userId: socket.userId,
        groupId: groupId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { groupId } = data;
      socket.to(`group_${groupId}`).emit('user_typing', {
        userId: socket.userId,
        groupId: groupId,
        isTyping: false
      });
    });

    // Handle reactions
    socket.on('add_reaction', async (data) => {
      try {
        const { messageId, emoji } = data;
        const userId = socket.userId;
        
        const GroupMessage = require('../models/groupMessage');
        const message = await GroupMessage.findById(messageId);
        
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        await message.addReaction(userId, emoji);
        await message.populate('reactions.userId', 'name username');

        io.to(`group_${message.groupId}`).emit('reaction_added', {
          messageId: messageId,
          reactions: message.reactions,
          addedBy: userId
        });

      } catch (error) {
        console.error('❌ [SOCKET.IO] Error adding reaction:', error);
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('🔌 [SOCKET.IO] User disconnected:', socket.id);
      
      if (socket.userId) {
        activeUsers.delete(socket.userId);
        
        groupRooms.forEach((users, groupId) => {
          if (users.has(socket.userId)) {
            users.delete(socket.userId);
            socket.to(`group_${groupId}`).emit('user_left', {
              userId: socket.userId,
              groupId: groupId
            });
          }
        });
      }
    });
  });

  // Helper function to join user to their groups
  async function joinUserGroups(socket, userId) {
    try {
      const Group = require('../models/group');
      const userGroups = await Group.find({
        $or: [
          { createdBy: userId },
          { 'members.userId': userId }
        ],
        isActive: true
      });

      for (const group of userGroups) {
        socket.join(`group_${group._id}`);
        
        if (!groupRooms.has(group._id.toString())) {
          groupRooms.set(group._id.toString(), new Set());
        }
        groupRooms.get(group._id.toString()).add(userId);
      }

      console.log(`👥 [SOCKET.IO] User ${userId} joined ${userGroups.length} groups`);
    } catch (error) {
      console.error('❌ [SOCKET.IO] Error joining user groups:', error);
    }
  }

  return {
    io,
    getStats: () => ({
      clients: io.engine.clientsCount,
      activeUsers: activeUsers.size,
      activeGroups: groupRooms.size
    })
  };
}

module.exports = createSocketServer;
