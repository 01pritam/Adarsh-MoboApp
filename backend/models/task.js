const mongoose = require('mongoose');
const { Schema } = mongoose;

const TaskSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  groupId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Group', 
    required: true 
  },
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'Agent'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  taskType: {
    type: String,
    enum: ['food_order', 'medication', 'appointment', 'emergency', 'general'],
    default: 'general'
  },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
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
TaskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = Date.now();
  }
  next();
});

// Index for efficient queries
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ groupId: 1, status: 1 });
TaskSchema.index({ assignedTo: 1, status: 1 });

// Static method to get group tasks
TaskSchema.statics.getGroupTasks = function(groupId, status = null) {
  const query = { groupId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('userId', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Task', TaskSchema);
