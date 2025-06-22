const mongoose = require('mongoose');
const { Schema } = mongoose;

const AgentSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  transcript: { 
    type: String, 
    required: true,
    trim: true
  },
  aiResponse: {
    type: String,
    required: false
  },
  metadata: {
    urgency: { 
      type: String, 
      enum: ['urgent', 'not urgent'], 
      default: 'not urgent' 
    },
    audioUrl: { 
      type: String 
    },
    processingTime: { 
      type: Number 
    },
    taskCreated: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task'
    }
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
AgentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
AgentSchema.index({ userId: 1, createdAt: -1 });
AgentSchema.index({ 'metadata.urgency': 1 });

// Static method to get user's agent history
AgentSchema.statics.getUserHistory = function(userId, limit = 20) {
  return this.find({ userId })
    .populate('userId', 'name email')
    .populate('metadata.taskId')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Agent', AgentSchema);
