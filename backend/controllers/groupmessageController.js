// const mongoose = require('mongoose');
// const GroupMessage = require('../models/groupMessage');
// const Group = require('../models/group');
// const User = require('../models/user');

// // Send a message to group
// const sendMessage = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const { content, type = 'text', replyTo, mentions } = req.body;
//     const senderId = req.user.userId;

//     // Validate required fields
//     if (!content || !content.text) {
//       return res.status(400).json({
//         success: false,
//         message: 'Message content is required'
//       });
//     }

//     // Check if group exists and user is a member
//     const group = await Group.findById(groupId);
//     if (!group) {
//       return res.status(404).json({
//         success: false,
//         message: 'Group not found'
//       });
//     }

//     if (!group.isMember(senderId)) {
//       return res.status(403).json({
//         success: false,
//         message: 'You are not a member of this group'
//       });
//     }

//     // Create new message
//     const message = new GroupMessage({
//       groupId: groupId,
//       sender: senderId,
//       content: {
//         text: content.text,
//         type: type,
//         fileUrl: content.fileUrl,
//         fileName: content.fileName,
//         fileSize: content.fileSize
//       },
//       replyTo: replyTo || null,
//       mentions: mentions || []
//     });

//     await message.save();

//     // Populate message data
//     await message.populate('sender', 'name email username profilePicture');
//     await message.populate('replyTo', 'content.text sender');
//     await message.populate('mentions', 'name username');

//     res.status(201).json({
//       success: true,
//       message: 'Message sent successfully',
//       data: { message }
//     });

//   } catch (error) {
//     console.error('Error sending message:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error sending message',
//       error: error.message
//     });
//   }
// };

// // Get group messages with pagination
// const getGroupMessages = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const { page = 1, limit = 50 } = req.query;
//     const userId = req.user.userId;

//     // Check if group exists and user is a member
//     const group = await Group.findById(groupId);
//     if (!group) {
//       return res.status(404).json({
//         success: false,
//         message: 'Group not found'
//       });
//     }

//     if (!group.isMember(userId)) {
//       return res.status(403).json({
//         success: false,
//         message: 'You are not a member of this group'
//       });
//     }

//     // Get messages
//     const messages = await GroupMessage.getGroupMessages(
//       groupId, 
//       parseInt(page), 
//       parseInt(limit)
//     );

//     // Get total count for pagination
//     const totalMessages = await GroupMessage.countDocuments({
//       groupId: groupId,
//       isDeleted: false
//     });

//     const totalPages = Math.ceil(totalMessages / limit);

//     res.json({
//       success: true,
//       data: {
//         messages: messages.reverse(), // Reverse to show oldest first
//         pagination: {
//           currentPage: parseInt(page),
//           totalPages,
//           totalMessages,
//           hasNext: page < totalPages,
//           hasPrev: page > 1
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Error fetching messages:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching messages',
//       error: error.message
//     });
//   }
// };

// // Mark message as read
// const markMessageAsRead = async (req, res) => {
//   try {
//     const { messageId } = req.params;
//     const userId = req.user.userId;

//     const message = await GroupMessage.findById(messageId);
//     if (!message) {
//       return res.status(404).json({
//         success: false,
//         message: 'Message not found'
//       });
//     }

//     // Check if user is member of the group
//     const group = await Group.findById(message.groupId);
//     if (!group || !group.isMember(userId)) {
//       return res.status(403).json({
//         success: false,
//         message: 'You are not authorized to read this message'
//       });
//     }

//     await message.markAsRead(userId);

//     res.json({
//       success: true,
//       message: 'Message marked as read'
//     });

//   } catch (error) {
//     console.error('Error marking message as read:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error marking message as read',
//       error: error.message
//     });
//   }
// };

// // Mark all messages in group as read
// const markAllMessagesAsRead = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const userId = req.user.userId;

//     // Check if group exists and user is a member
//     const group = await Group.findById(groupId);
//     if (!group) {
//       return res.status(404).json({
//         success: false,
//         message: 'Group not found'
//       });
//     }

//     if (!group.isMember(userId)) {
//       return res.status(403).json({
//         success: false,
//         message: 'You are not a member of this group'
//       });
//     }

//     // Find all unread messages for this user in this group
//     const unreadMessages = await GroupMessage.find({
//       groupId: groupId,
//       isDeleted: false,
//       'readBy.userId': { $ne: userId },
//       sender: { $ne: userId } // Don't mark own messages
//     });

//     // Mark all as read
//     const markPromises = unreadMessages.map(message => message.markAsRead(userId));
//     await Promise.all(markPromises);

//     res.json({
//       success: true,
//       message: `Marked ${unreadMessages.length} messages as read`
//     });

//   } catch (error) {
//     console.error('Error marking all messages as read:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error marking messages as read',
//       error: error.message
//     });
//   }
// };

// // Delete message
// const deleteMessage = async (req, res) => {
//   try {
//     const { messageId } = req.params;
//     const userId = req.user.userId;

//     const message = await GroupMessage.findById(messageId);
//     if (!message) {
//       return res.status(404).json({
//         success: false,
//         message: 'Message not found'
//       });
//     }

//     // Check if user is the sender or group admin
//     const group = await Group.findById(message.groupId);
//     if (!group) {
//       return res.status(404).json({
//         success: false,
//         message: 'Group not found'
//       });
//     }

//     const canDelete = message.sender.toString() === userId || group.isAdmin(userId);
//     if (!canDelete) {
//       return res.status(403).json({
//         success: false,
//         message: 'You can only delete your own messages or you must be a group admin'
//       });
//     }

//     // Soft delete
//     message.isDeleted = true;
//     message.deletedAt = new Date();
//     await message.save();

//     res.json({
//       success: true,
//       message: 'Message deleted successfully'
//     });

//   } catch (error) {
//     console.error('Error deleting message:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting message',
//       error: error.message
//     });
//   }
// };

// // Edit message
// const editMessage = async (req, res) => {
//   try {
//     const { messageId } = req.params;
//     const { content } = req.body;
//     const userId = req.user.userId;

//     if (!content || !content.text) {
//       return res.status(400).json({
//         success: false,
//         message: 'Message content is required'
//       });
//     }

//     const message = await GroupMessage.findById(messageId);
//     if (!message) {
//       return res.status(404).json({
//         success: false,
//         message: 'Message not found'
//       });
//     }

//     // Check if user is the sender
//     if (message.sender.toString() !== userId) {
//       return res.status(403).json({
//         success: false,
//         message: 'You can only edit your own messages'
//       });
//     }

//     // Store original content if not already edited
//     if (!message.isEdited) {
//       message.originalContent = message.content.text;
//     }

//     // Update message
//     message.content.text = content.text;
//     message.isEdited = true;
//     message.editedAt = new Date();
//     await message.save();

//     await message.populate('sender', 'name email username profilePicture');

//     res.json({
//       success: true,
//       message: 'Message edited successfully',
//       data: { message }
//     });

//   } catch (error) {
//     console.error('Error editing message:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error editing message',
//       error: error.message
//     });
//   }
// };

// // Add reaction to message
// const addReaction = async (req, res) => {
//   try {
//     const { messageId } = req.params;
//     const { emoji } = req.body;
//     const userId = req.user.userId;

//     if (!emoji) {
//       return res.status(400).json({
//         success: false,
//         message: 'Emoji is required'
//       });
//     }

//     const message = await GroupMessage.findById(messageId);
//     if (!message) {
//       return res.status(404).json({
//         success: false,
//         message: 'Message not found'
//       });
//     }

//     // Check if user is member of the group
//     const group = await Group.findById(message.groupId);
//     if (!group || !group.isMember(userId)) {
//       return res.status(403).json({
//         success: false,
//         message: 'You are not authorized to react to this message'
//       });
//     }

//     await message.addReaction(userId, emoji);
//     await message.populate('reactions.userId', 'name username');

//     res.json({
//       success: true,
//       message: 'Reaction added successfully',
//       data: { reactions: message.reactions }
//     });

//   } catch (error) {
//     console.error('Error adding reaction:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error adding reaction',
//       error: error.message
//     });
//   }
// };

// // Remove reaction from message
// const removeReaction = async (req, res) => {
//   try {
//     const { messageId } = req.params;
//     const { emoji } = req.body;
//     const userId = req.user.userId;

//     const message = await GroupMessage.findById(messageId);
//     if (!message) {
//       return res.status(404).json({
//         success: false,
//         message: 'Message not found'
//       });
//     }

//     await message.removeReaction(userId, emoji);
//     await message.populate('reactions.userId', 'name username');

//     res.json({
//       success: true,
//       message: 'Reaction removed successfully',
//       data: { reactions: message.reactions }
//     });

//   } catch (error) {
//     console.error('Error removing reaction:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error removing reaction',
//       error: error.message
//     });
//   }
// };

// // Get unread message count for a group
// const getUnreadCount = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const userId = req.user.userId;

//     // Check if group exists and user is a member
//     const group = await Group.findById(groupId);
//     if (!group) {
//       return res.status(404).json({
//         success: false,
//         message: 'Group not found'
//       });
//     }

//     if (!group.isMember(userId)) {
//       return res.status(403).json({
//         success: false,
//         message: 'You are not a member of this group'
//       });
//     }

//     const unreadCount = await GroupMessage.getUnreadCount(groupId, userId);

//     res.json({
//       success: true,
//       data: { unreadCount }
//     });

//   } catch (error) {
//     console.error('Error getting unread count:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error getting unread count',
//       error: error.message
//     });
//   }
// };

// module.exports = {
//   sendMessage,
//   getGroupMessages,
//   markMessageAsRead,
//   markAllMessagesAsRead,
//   deleteMessage,
//   editMessage,
//   addReaction,
//   removeReaction,
//   getUnreadCount
// };




const GroupMessage = require('../models/groupMessage');
const Group = require('../models/group');
const socketService = require('../services/socketService');

// ✅ UPDATED: Send message (now also broadcasts via Socket.IO)
const sendMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content, replyTo } = req.body;
    const userId = req.user.userId;

    console.log('📨 [REST] Sending message via REST API');

    // Verify user is member of the group
    const group = await Group.findById(groupId);
    if (!group || !group.isMember(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send message to this group'
      });
    }

    // Create message in database
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

    // ✅ NEW: Broadcast via Socket.IO (real-time)
    socketService.broadcastToGroup(groupId, 'new_message', {
      message: message,
      groupId: groupId,
      timestamp: new Date()
    });

    console.log('✅ [REST] Message sent and broadcasted');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });

  } catch (error) {
    console.error('❌ [REST] Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// ✅ KEEP: Get messages (for loading message history)
const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.userId;

    console.log('📥 [REST] Loading message history');

    // Verify user is member of the group
    const group = await Group.findById(groupId);
    if (!group || !group.isMember(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view messages from this group'
      });
    }

    const skip = (page - 1) * limit;
    
    const messages = await GroupMessage.find({
      groupId: groupId,
      isDeleted: false
    })
    .populate('sender', 'name email username profilePicture')
    .populate('replyTo', 'content.text sender')
    .populate('mentions', 'name username')
    .populate('reactions.userId', 'name username')
    .sort({ createdAt: -1 }) // Newest first
    .limit(parseInt(limit))
    .skip(skip);

    const totalMessages = await GroupMessage.countDocuments({
      groupId: groupId,
      isDeleted: false
    });

    const totalPages = Math.ceil(totalMessages / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalMessages,
          hasNext,
          hasPrev,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ [REST] Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages',
      error: error.message
    });
  }
};

// ✅ UPDATED: Edit message (now also broadcasts via Socket.IO)
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    console.log('✏️ [REST] Editing message via REST API');

    const message = await GroupMessage.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this message'
      });
    }

    // Store original content for history
    if (!message.originalContent) {
      message.originalContent = message.content.text;
    }

    // Update message
    message.content.text = content.text;
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();
    await message.populate('sender', 'name email username profilePicture');

    // ✅ NEW: Broadcast edit via Socket.IO
    socketService.broadcastToGroup(message.groupId, 'message_edited', {
      messageId: messageId,
      message: message,
      timestamp: new Date()
    });

    console.log('✅ [REST] Message edited and broadcasted');

    res.status(200).json({
      success: true,
      message: 'Message edited successfully',
      data: { message }
    });

  } catch (error) {
    console.error('❌ [REST] Error editing message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit message',
      error: error.message
    });
  }
};

// ✅ UPDATED: Delete message (now also broadcasts via Socket.IO)
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    console.log('🗑️ [REST] Deleting message via REST API');

    const message = await GroupMessage.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender or group admin
    const group = await Group.findById(message.groupId);
    const isAdmin = group.isAdmin(userId);
    const isSender = message.sender.toString() === userId;

    if (!isSender && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    // Soft delete
    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    // ✅ NEW: Broadcast deletion via Socket.IO
    socketService.broadcastToGroup(message.groupId, 'message_deleted', {
      messageId: messageId,
      groupId: message.groupId,
      timestamp: new Date()
    });

    console.log('✅ [REST] Message deleted and broadcasted');

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('❌ [REST] Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

// ✅ UPDATED: Add reaction (now also broadcasts via Socket.IO)
const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.userId;

    console.log('😀 [REST] Adding reaction via REST API');

    const message = await GroupMessage.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.addReaction(userId, emoji);
    await message.populate('reactions.userId', 'name username');

    // ✅ NEW: Broadcast reaction via Socket.IO
    socketService.broadcastToGroup(message.groupId, 'reaction_added', {
      messageId: messageId,
      reactions: message.reactions,
      addedBy: userId
    });

    console.log('✅ [REST] Reaction added and broadcasted');

    res.status(200).json({
      success: true,
      message: 'Reaction added successfully',
      data: { reactions: message.reactions }
    });

  } catch (error) {
    console.error('❌ [REST] Error adding reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction',
      error: error.message
    });
  }
};

// ✅ KEEP: Mark as read
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await GroupMessage.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.markAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('❌ [REST] Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
};

// ✅ KEEP: Mark all as read
const markAllMessagesAsRead = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;

    await GroupMessage.updateMany(
      {
        groupId: groupId,
        'readBy.userId': { $ne: userId },
        sender: { $ne: userId }
      },
      {
        $push: {
          readBy: {
            userId: userId,
            readAt: new Date()
          }
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'All messages marked as read'
    });

  } catch (error) {
    console.error('❌ [REST] Error marking all messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all messages as read',
      error: error.message
    });
  }
};

// ✅ KEEP: Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;

    const unreadCount = await GroupMessage.countDocuments({
      groupId: groupId,
      isDeleted: false,
      'readBy.userId': { $ne: userId },
      sender: { $ne: userId }
    });

    res.status(200).json({
      success: true,
      message: 'Unread count retrieved successfully',
      data: { unreadCount }
    });

  } catch (error) {
    console.error('❌ [REST] Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

module.exports = {
  sendMessage,
  getGroupMessages,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction: addReaction, // Same logic for remove
  markMessageAsRead,
  markAllMessagesAsRead,
  getUnreadCount
};
