const mongoose = require('mongoose');
const { Schema } = mongoose;

const GroupMessageSchema = new Schema({
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    text: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'audio', 'video'],
      default: 'text'
    },
    fileUrl: {
      type: String,
      trim: true
    },
    fileName: {
      type: String,
      trim: true
    },
    fileSize: {
      type: Number
    }
  },
  // Reply/Thread functionality
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'GroupMessage'
  },
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  // Read receipts - array of users who have read the message
  readBy: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  // Edit functionality
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  originalContent: {
    type: String
  },
  // Mentions
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Reactions
  reactions: [{
    userId: {
      type: Schema.Types.ObjectId,
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
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
GroupMessageSchema.index({ groupId: 1, createdAt: -1 });
GroupMessageSchema.index({ sender: 1 });
GroupMessageSchema.index({ 'readBy.userId': 1 });
GroupMessageSchema.index({ isDeleted: 1 });

// Instance methods
GroupMessageSchema.methods.markAsRead = function(userId) {
  const alreadyRead = this.readBy.some(read => read.userId.toString() === userId.toString());
  if (!alreadyRead) {
    this.readBy.push({
      userId: userId,
      readAt: new Date()
    });
  }
  return this.save();
};

GroupMessageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(reaction => 
    reaction.userId.toString() !== userId.toString() || reaction.emoji !== emoji
  );
  
  // Add new reaction
  this.reactions.push({
    userId: userId,
    emoji: emoji
  });
  
  return this.save();
};

GroupMessageSchema.methods.removeReaction = function(userId, emoji) {
  this.reactions = this.reactions.filter(reaction => 
    !(reaction.userId.toString() === userId.toString() && reaction.emoji === emoji)
  );
  return this.save();
};

// Static methods
GroupMessageSchema.statics.getGroupMessages = function(groupId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({
    groupId: groupId,
    isDeleted: false
  })
  .populate('sender', 'name email username profilePicture')
  .populate('replyTo', 'content.text sender')
  .populate('mentions', 'name username')
  .populate('reactions.userId', 'name username')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

GroupMessageSchema.statics.getUnreadCount = function(groupId, userId) {
  return this.countDocuments({
    groupId: groupId,
    isDeleted: false,
    'readBy.userId': { $ne: userId },
    sender: { $ne: userId } // Don't count own messages
  });
};

module.exports = mongoose.model('GroupMessage', GroupMessageSchema);
