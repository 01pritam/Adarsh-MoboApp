// const socketIo = require('socket.io');
// const jwt = require('jsonwebtoken');

// class SocketService {
//   constructor() {
//     this.io = null;
//     this.activeUsers = new Map();
//     this.groupRooms = new Map();
//   }

//   // Initialize Socket.IO with server
//   initialize(server) {
//     console.log('🔌 [SOCKET] Initializing Socket.IO service...');
    
//     this.io = socketIo(server, {
//       cors: {
//         origin: [
//           'http://localhost:8081',
//           'http://localhost:8082',
//           'http://localhost:8083',
//           'exp://192.168.1.32:8081',
//           'exp://localhost:8081',
//           'https://yourfrontenddomain.com',
//         ],
//         methods: ['GET', 'POST'],
//         credentials: true
//       },
//       path: '/socket.io',
//       transports: ['websocket', 'polling']
//     });

//     this.setupConnectionHandlers();
//     this.setupHealthMonitoring();
    
//     console.log('✅ [SOCKET] Socket.IO service initialized successfully');
//     return this.io;
//   }

//   // Setup connection event handlers
//   setupConnectionHandlers() {
//     this.io.on('connection', (socket) => {
//       console.log('🔌 [SOCKET.IO] User connected:', socket.id);
      
//       // Authentication handler
//       socket.on('authenticate', (data) => this.handleAuthentication(socket, data));
      
//       // Group management handlers
//       socket.on('join_group', (data) => this.handleJoinGroup(socket, data));
//       socket.on('leave_group', (data) => this.handleLeaveGroup(socket, data));
      
//       // Message handlers
//       socket.on('send_message', (data) => this.handleSendMessage(socket, data));
      
//       // Interaction handlers
//       socket.on('typing_start', (data) => this.handleTypingStart(socket, data));
//       socket.on('typing_stop', (data) => this.handleTypingStop(socket, data));
//       socket.on('add_reaction', (data) => this.handleAddReaction(socket, data));
      
//       // Disconnection handler
//       socket.on('disconnect', () => this.handleDisconnection(socket));
//     });
//   }

//   // Authentication handler
//   async handleAuthentication(socket, data) {
//     try {
//       const { userId, token } = data;
//       console.log('🔐 [SOCKET.IO] Authentication attempt for user:', userId);
      
//       // Store user connection (skip JWT verification for now)
//       this.activeUsers.set(userId, {
//         socketId: socket.id,
//         userId: userId,
//         connectedAt: new Date()
//       });
      
//       socket.userId = userId;
//       console.log(`✅ [SOCKET.IO] User ${userId} authenticated successfully`);
      
//       // Join user to their groups
//       await this.joinUserToGroups(socket, userId);
      
//       socket.emit('authenticated', { success: true, userId });
      
//     } catch (error) {
//       console.error('❌ [SOCKET.IO] Authentication failed:', error.message);
//       socket.emit('auth_error', { message: 'Authentication failed' });
//     }
//   }

//   // Join group handler
//   async handleJoinGroup(socket, data) {
//     try {
//       const { groupId } = data;
//       const userId = socket.userId;
      
//       if (!userId) {
//         socket.emit('error', { message: 'Not authenticated' });
//         return;
//       }

//       console.log(`👥 [SOCKET.IO] User ${userId} joining group ${groupId}`);

//       // Join the group room
//       socket.join(`group_${groupId}`);
      
//       // Track group membership
//       if (!this.groupRooms.has(groupId)) {
//         this.groupRooms.set(groupId, new Set());
//       }
//       this.groupRooms.get(groupId).add(userId);
      
//       console.log(`👥 [SOCKET.IO] User ${userId} joined group ${groupId}`);
      
//       // Notify others in the group
//       socket.to(`group_${groupId}`).emit('user_joined', {
//         userId: userId,
//         groupId: groupId,
//         timestamp: new Date()
//       });
      
//       socket.emit('group_joined', { groupId, success: true });
      
//     } catch (error) {
//       console.error('❌ [SOCKET.IO] Error joining group:', error);
//       socket.emit('error', { message: 'Failed to join group' });
//     }
//   }

//   // Send message handler
//   async handleSendMessage(socket, data) {
//     try {
//       const { groupId, content, replyTo } = data;
//       const userId = socket.userId;
      
//       if (!userId) {
//         socket.emit('error', { message: 'Not authenticated' });
//         return;
//       }

//       console.log(`📨 [SOCKET.IO] User ${userId} sending message to group ${groupId}`);

//       // Create message in database
//       const GroupMessage = require('../models/groupMessage');
//       const message = new GroupMessage({
//         groupId: groupId,
//         sender: userId,
//         content: {
//           text: content.text,
//           type: content.type || 'text'
//         },
//         replyTo: replyTo || null
//       });

//       await message.save();
      
//       // Populate message data
//       await message.populate('sender', 'name email username profilePicture');
//       if (replyTo) {
//         await message.populate('replyTo', 'content.text sender');
//       }

//       // Broadcast message to all group members
//       this.io.to(`group_${groupId}`).emit('new_message', {
//         message: message,
//         groupId: groupId,
//         timestamp: new Date()
//       });

//       console.log(`✅ [SOCKET.IO] Message sent in group ${groupId} by user ${userId}`);
      
//     } catch (error) {
//       console.error('❌ [SOCKET.IO] Error sending message:', error);
//       socket.emit('error', { message: 'Failed to send message' });
//     }
//   }

//   // Typing indicators
//   handleTypingStart(socket, data) {
//     const { groupId } = data;
//     socket.to(`group_${groupId}`).emit('user_typing', {
//       userId: socket.userId,
//       groupId: groupId,
//       isTyping: true
//     });
//   }

//   handleTypingStop(socket, data) {
//     const { groupId } = data;
//     socket.to(`group_${groupId}`).emit('user_typing', {
//       userId: socket.userId,
//       groupId: groupId,
//       isTyping: false
//     });
//   }

//   // Add reaction handler
//   async handleAddReaction(socket, data) {
//     try {
//       const { messageId, emoji } = data;
//       const userId = socket.userId;
      
//       const GroupMessage = require('../models/groupMessage');
//       const message = await GroupMessage.findById(messageId);
      
//       if (!message) {
//         socket.emit('error', { message: 'Message not found' });
//         return;
//       }

//       await message.addReaction(userId, emoji);
//       await message.populate('reactions.userId', 'name username');

//       // Broadcast reaction to group
//       this.io.to(`group_${message.groupId}`).emit('reaction_added', {
//         messageId: messageId,
//         reactions: message.reactions,
//         addedBy: userId
//       });

//     } catch (error) {
//       console.error('❌ [SOCKET.IO] Error adding reaction:', error);
//       socket.emit('error', { message: 'Failed to add reaction' });
//     }
//   }

//   // Disconnection handler
//   handleDisconnection(socket) {
//     console.log('🔌 [SOCKET.IO] User disconnected:', socket.id);
    
//     if (socket.userId) {
//       this.activeUsers.delete(socket.userId);
      
//       this.groupRooms.forEach((users, groupId) => {
//         if (users.has(socket.userId)) {
//           users.delete(socket.userId);
//           socket.to(`group_${groupId}`).emit('user_left', {
//             userId: socket.userId,
//             groupId: groupId
//           });
//         }
//       });
//     }
//   }

//   // Helper method to join user to their groups
//   async joinUserToGroups(socket, userId) {
//     try {
//       const Group = require('../models/group');
//       const userGroups = await Group.find({
//         $or: [
//           { createdBy: userId },
//           { 'members.userId': userId }
//         ],
//         isActive: true
//       });

//       for (const group of userGroups) {
//         socket.join(`group_${group._id}`);
        
//         if (!this.groupRooms.has(group._id.toString())) {
//           this.groupRooms.set(group._id.toString(), new Set());
//         }
//         this.groupRooms.get(group._id.toString()).add(userId);
//       }

//       console.log(`👥 [SOCKET.IO] User ${userId} joined ${userGroups.length} groups`);
//     } catch (error) {
//       console.error('❌ [SOCKET.IO] Error joining user groups:', error);
//     }
//   }

//   // Setup health monitoring
//   setupHealthMonitoring() {
//     const healthCheck = setInterval(() => {
//       console.log(`📊 [SOCKET.IO] Active connections: ${this.io.engine.clientsCount}`);
//     }, 60000);

//     this.io.on('close', () => {
//       clearInterval(healthCheck);
//     });
//   }

//   // Get statistics
//   getStats() {
//     return {
//       activeConnections: this.io ? this.io.engine.clientsCount : 0,
//       activeUsers: this.activeUsers.size,
//       activeGroups: this.groupRooms.size
//     };
//   }

//   // Broadcast to specific group
//   broadcastToGroup(groupId, event, data) {
//     if (this.io) {
//       this.io.to(`group_${groupId}`).emit(event, data);
//     }
//   }

//   // Graceful shutdown
//   shutdown() {
//     console.log('🛑 [SOCKET.IO] Shutting down Socket.IO service...');
//     if (this.io) {
//       this.io.close(() => {
//         console.log('✅ [SOCKET.IO] Socket.IO service shutdown complete');
//       });
//     }
//   }
// }

// // Export singleton instance
// module.exports = new SocketService();



const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketService {
  constructor() {
    this.io = null;
    this.activeUsers = new Map();
    this.groupRooms = new Map();
  }

  // Initialize Socket.IO with server
  initialize(server) {
    console.log('🔌 [SOCKET] Initializing Socket.IO service...');
    
    this.io = socketIo(server, {
      cors: {
        origin: "*", // ✅ Allow all origins for now
        methods: ["GET", "POST"],
        credentials: false // ✅ Set to false for deployed servers
      },
      path: '/socket.io',
      transports: ['polling', 'websocket'], // ✅ Support both transports
      allowEIO3: true, // ✅ Support older clients
      // ✅ Add these for deployed servers
      pingTimeout: 60000,
      pingInterval: 25000,
      upgradeTimeout: 30000,
      maxHttpBufferSize: 1e6
    });

    this.setupConnectionHandlers();
    this.setupHealthMonitoring();
    
    console.log('✅ [SOCKET] Socket.IO service initialized successfully');
    return this.io;
  }

  // Setup connection event handlers
  setupConnectionHandlers() {
    this.io.on('connection', (socket) => {
      console.log('🔌 [SOCKET.IO] User connected:', socket.id);
      
      // Authentication handler
      socket.on('authenticate', (data) => this.handleAuthentication(socket, data));
      
      // Group management handlers
      socket.on('join_group', (data) => this.handleJoinGroup(socket, data));
      socket.on('leave_group', (data) => this.handleLeaveGroup(socket, data));
      
      // Message handlers
      socket.on('send_message', (data) => this.handleSendMessage(socket, data));
      
      // Interaction handlers
      socket.on('typing_start', (data) => this.handleTypingStart(socket, data));
      socket.on('typing_stop', (data) => this.handleTypingStop(socket, data));
      socket.on('add_reaction', (data) => this.handleAddReaction(socket, data));
      
      // Disconnection handler
      socket.on('disconnect', () => this.handleDisconnection(socket));
    });
  }

  // Authentication handler
  async handleAuthentication(socket, data) {
    try {
      const { userId, token } = data;
      console.log('🔐 [SOCKET.IO] Authentication attempt for user:', userId);
      
      // Skip JWT verification for now - you can add it back later
      // const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // if (decoded.userId !== userId) {
      //   throw new Error('Token mismatch');
      // }
      
      // Store user connection
      this.activeUsers.set(userId, {
        socketId: socket.id,
        userId: userId,
        connectedAt: new Date()
      });
      
      socket.userId = userId;
      console.log(`✅ [SOCKET.IO] User ${userId} authenticated successfully`);
      
      // Join user to their groups
      await this.joinUserToGroups(socket, userId);
      
      socket.emit('authenticated', { success: true, userId });
      
    } catch (error) {
      console.error('❌ [SOCKET.IO] Authentication failed:', error.message);
      socket.emit('auth_error', { message: 'Authentication failed' });
    }
  }

  // Join group handler
  async handleJoinGroup(socket, data) {
    try {
      const { groupId } = data;
      const userId = socket.userId;
      
      if (!userId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      console.log(`👥 [SOCKET.IO] User ${userId} joining group ${groupId}`);

      // Verify user is member of the group
      const Group = require('../models/group');
      const group = await Group.findById(groupId);
      
      if (!group) {
        socket.emit('error', { message: 'Group not found' });
        return;
      }

      // For now, allow all authenticated users to join - you can add permission check later
      // if (!group.isMember(userId)) {
      //   socket.emit('error', { message: 'Not authorized to join this group' });
      //   return;
      // }

      // Join the group room
      socket.join(`group_${groupId}`);
      
      // Track group membership
      if (!this.groupRooms.has(groupId)) {
        this.groupRooms.set(groupId, new Set());
      }
      this.groupRooms.get(groupId).add(userId);
      
      console.log(`👥 [SOCKET.IO] User ${userId} joined group ${groupId}`);
      
      // Notify others in the group
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
  }

  // Send message handler
  async handleSendMessage(socket, data) {
    try {
      const { groupId, content, replyTo } = data;
      const userId = socket.userId;
      
      if (!userId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      console.log(`📨 [SOCKET.IO] User ${userId} sending message to group ${groupId}`);

      // Create message in database
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
      
      // Populate message data
      await message.populate('sender', 'name email username profilePicture');
      if (replyTo) {
        await message.populate('replyTo', 'content.text sender');
      }

      // Broadcast message to all group members
      this.io.to(`group_${groupId}`).emit('new_message', {
        message: message,
        groupId: groupId,
        timestamp: new Date()
      });

      console.log(`✅ [SOCKET.IO] Message sent in group ${groupId} by user ${userId}`);
      
    } catch (error) {
      console.error('❌ [SOCKET.IO] Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  // Typing indicators
  handleTypingStart(socket, data) {
    const { groupId } = data;
    console.log(`⌨️ [SOCKET.IO] User ${socket.userId} started typing in group ${groupId}`);
    socket.to(`group_${groupId}`).emit('user_typing', {
      userId: socket.userId,
      groupId: groupId,
      isTyping: true
    });
  }

  handleTypingStop(socket, data) {
    const { groupId } = data;
    console.log(`⌨️ [SOCKET.IO] User ${socket.userId} stopped typing in group ${groupId}`);
    socket.to(`group_${groupId}`).emit('user_typing', {
      userId: socket.userId,
      groupId: groupId,
      isTyping: false
    });
  }

  // Add reaction handler
  async handleAddReaction(socket, data) {
    try {
      const { messageId, emoji } = data;
      const userId = socket.userId;
      
      console.log(`😀 [SOCKET.IO] User ${userId} adding reaction ${emoji} to message ${messageId}`);
      
      const GroupMessage = require('../models/groupMessage');
      const message = await GroupMessage.findById(messageId);
      
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      await message.addReaction(userId, emoji);
      await message.populate('reactions.userId', 'name username');

      // Broadcast reaction to group
      this.io.to(`group_${message.groupId}`).emit('reaction_added', {
        messageId: messageId,
        reactions: message.reactions,
        addedBy: userId
      });

      console.log(`✅ [SOCKET.IO] Reaction added successfully`);

    } catch (error) {
      console.error('❌ [SOCKET.IO] Error adding reaction:', error);
      socket.emit('error', { message: 'Failed to add reaction' });
    }
  }

  // Leave group handler
  handleLeaveGroup(socket, data) {
    const { groupId } = data;
    const userId = socket.userId;
    
    console.log(`👋 [SOCKET.IO] User ${userId} leaving group ${groupId}`);
    
    socket.leave(`group_${groupId}`);
    
    if (this.groupRooms.has(groupId)) {
      this.groupRooms.get(groupId).delete(userId);
    }
    
    socket.to(`group_${groupId}`).emit('user_left', {
      userId: userId,
      groupId: groupId
    });
  }

  // Disconnection handler
  handleDisconnection(socket) {
    console.log('🔌 [SOCKET.IO] User disconnected:', socket.id);
    
    if (socket.userId) {
      // Remove from active users
      this.activeUsers.delete(socket.userId);
      
      // Remove from group rooms
      this.groupRooms.forEach((users, groupId) => {
        if (users.has(socket.userId)) {
          users.delete(socket.userId);
          // Notify group members
          socket.to(`group_${groupId}`).emit('user_left', {
            userId: socket.userId,
            groupId: groupId
          });
        }
      });
    }
  }

  // Helper method to join user to their groups
  async joinUserToGroups(socket, userId) {
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
        
        if (!this.groupRooms.has(group._id.toString())) {
          this.groupRooms.set(group._id.toString(), new Set());
        }
        this.groupRooms.get(group._id.toString()).add(userId);
      }

      console.log(`👥 [SOCKET.IO] User ${userId} joined ${userGroups.length} groups`);
    } catch (error) {
      console.error('❌ [SOCKET.IO] Error joining user groups:', error);
    }
  }

  // Setup health monitoring
  setupHealthMonitoring() {
    const healthCheck = setInterval(() => {
      const stats = this.getStats();
      console.log(`📊 [SOCKET.IO] Active connections: ${stats.activeConnections}`);
      console.log(`👥 [SOCKET.IO] Active users: ${stats.activeUsers}`);
      console.log(`🏠 [SOCKET.IO] Active groups: ${stats.activeGroups}`);
    }, 60000); // Every minute

    this.io.on('close', () => {
      clearInterval(healthCheck);
    });
  }

  // Get statistics
  getStats() {
    return {
      activeConnections: this.io ? this.io.engine.clientsCount : 0,
      activeUsers: this.activeUsers.size,
      activeGroups: this.groupRooms.size,
      groupDetails: Array.from(this.groupRooms.entries()).map(([groupId, users]) => ({
        groupId,
        userCount: users.size
      }))
    };
  }

  // Broadcast to specific group
  broadcastToGroup(groupId, event, data) {
    if (this.io) {
      console.log(`📡 [SOCKET.IO] Broadcasting ${event} to group ${groupId}`);
      this.io.to(`group_${groupId}`).emit(event, data);
    }
  }

  // Broadcast to specific user
  broadcastToUser(userId, event, data) {
    const user = this.activeUsers.get(userId);
    if (user && this.io) {
      console.log(`📡 [SOCKET.IO] Broadcasting ${event} to user ${userId}`);
      this.io.to(user.socketId).emit(event, data);
    }
  }

  // Graceful shutdown
  shutdown() {
    console.log('🛑 [SOCKET.IO] Shutting down Socket.IO service...');
    if (this.io) {
      this.io.close(() => {
        console.log('✅ [SOCKET.IO] Socket.IO service shutdown complete');
      });
    }
  }
}

// Export singleton instance
module.exports = new SocketService();
