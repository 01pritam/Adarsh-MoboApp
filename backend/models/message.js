const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
  transcript: { 
    type: String, 
    required: true,
    trim: true
  },
  aiResponse: {
    type: String,
    required: true
  },
  audioUrl: { 
    type: String, 
    required: false 
  },
  urgencyFlag: { 
    type: Boolean, 
    default: false 
  },
  senderId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  familyMemberRoles: [{ 
    type: String,
    enum: ['son', 'daughter', 'spouse', 'grandchild', 'caregiver', 'other']
  }],
  notificationsSent: {
    type: Boolean,
    default: false
  },
  readBy: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  // Store metadata directly in MongoDB instead of separate service
  metadata: {
    urgency: { type: String, enum: ['urgent', 'not urgent'] },
    senderName: { type: String },
    familyMemberCount: { type: Number, default: 0 },
    processingTime: { type: Number }, // milliseconds
    audioGenerated: { type: Boolean, default: false }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
MessageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
MessageSchema.index({ senderId: 1, createdAt: -1 });
MessageSchema.index({ urgencyFlag: 1, createdAt: -1 });
MessageSchema.index({ 'metadata.urgency': 1, createdAt: -1 });

// Static method to get urgent messages
MessageSchema.statics.getUrgentMessages = function(limit = 10) {
  return this.find({ urgencyFlag: true })
    .populate('senderId', 'name email phoneNumber')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get messages by family member
MessageSchema.statics.getMessagesByFamily = function(userId, limit = 20) {
  return this.find({ 
    $or: [
      { senderId: userId },
      { 'readBy.userId': userId }
    ]
  })
    .populate('senderId', 'name email phoneNumber')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Message', MessageSchema);
