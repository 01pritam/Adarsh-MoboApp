const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReminderSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  reminderType: {
    type: String,
    enum: ['medication', 'appointment', 'meal', 'exercise', 'custom'],
    required: true
  },
  // Who the reminder is for (elderly user)
  elderlyUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Who created the reminder (family member)
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Group context
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  // Timing settings
  scheduledDateTime: {
    type: Date,
    required: true
  },
  // Recurring reminder settings
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: function() { return this.isRecurring; }
    },
    interval: {
      type: Number,
      default: 1, // Every 1 day/week/month
      min: 1
    },
    daysOfWeek: [{
      type: Number,
      min: 0, // Sunday = 0
      max: 6  // Saturday = 6
    }],
    endDate: {
      type: Date
    }
  },
  // Alarm settings
  alarmSettings: {
    soundType: {
      type: String,
      enum: ['default', 'gentle', 'urgent', 'custom'],
      default: 'default'
    },
    volume: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    vibrate: {
      type: Boolean,
      default: true
    },
    snoozeEnabled: {
      type: Boolean,
      default: true
    },
    snoozeDuration: {
      type: Number,
      default: 5, // minutes
      min: 1,
      max: 30
    }
  },
  // Status tracking
  status: {
    type: String,
    enum: ['active', 'completed', 'snoozed', 'dismissed', 'cancelled'],
    default: 'active'
  },
  // Notification tracking
  notificationSent: {
    type: Boolean,
    default: false
  },
  lastTriggered: {
    type: Date
  },
  nextTrigger: {
    type: Date
  },
  // Completion tracking
  completedAt: {
    type: Date
  },
  completedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Additional settings
  requiresConfirmation: {
    type: Boolean,
    default: true
  },
  autoComplete: {
    type: Boolean,
    default: false
  },
  // Metadata
  isActive: {
    type: Boolean,
    default: true
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

// Indexes for efficient queries
ReminderSchema.index({ elderlyUserId: 1, scheduledDateTime: 1 });
ReminderSchema.index({ createdBy: 1 });
ReminderSchema.index({ groupId: 1 });
ReminderSchema.index({ status: 1, isActive: 1 });
ReminderSchema.index({ nextTrigger: 1, status: 1 });

// Update the updatedAt field before saving
ReminderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate next trigger for recurring reminders
  if (this.isRecurring && this.status === 'active') {
    this.calculateNextTrigger();
  }
  
  next();
});

// Method to calculate next trigger time for recurring reminders
ReminderSchema.methods.calculateNextTrigger = function() {
  if (!this.isRecurring) {
    this.nextTrigger = this.scheduledDateTime;
    return;
  }

  const now = new Date();
  let nextTrigger = new Date(this.scheduledDateTime);

  switch (this.recurrencePattern.type) {
    case 'daily':
      while (nextTrigger <= now) {
        nextTrigger.setDate(nextTrigger.getDate() + this.recurrencePattern.interval);
      }
      break;
    
    case 'weekly':
      while (nextTrigger <= now) {
        nextTrigger.setDate(nextTrigger.getDate() + (7 * this.recurrencePattern.interval));
      }
      break;
    
    case 'monthly':
      while (nextTrigger <= now) {
        nextTrigger.setMonth(nextTrigger.getMonth() + this.recurrencePattern.interval);
      }
      break;
  }

  // Check if we've passed the end date
  if (this.recurrencePattern.endDate && nextTrigger > this.recurrencePattern.endDate) {
    this.status = 'completed';
    this.nextTrigger = null;
  } else {
    this.nextTrigger = nextTrigger;
  }
};

// Method to check if user can manage this reminder
ReminderSchema.methods.canManage = function(userId) {
  return this.createdBy.toString() === userId.toString() || 
         this.elderlyUserId.toString() === userId.toString();
};

// Static method to find active reminders for a user
ReminderSchema.statics.findActiveForUser = function(userId) {
  return this.find({
    elderlyUserId: userId,
    status: 'active',
    isActive: true,
    nextTrigger: { $gte: new Date() }
  }).populate('createdBy', 'name email')
    .populate('elderlyUserId', 'name email')
    .sort({ nextTrigger: 1 });
};

// Static method to find reminders due for notification
ReminderSchema.statics.findDueReminders = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    isActive: true,
    nextTrigger: { $lte: now },
    notificationSent: false
  }).populate('elderlyUserId', 'name email phoneNumber')
    .populate('createdBy', 'name email');
};

module.exports = mongoose.model('Reminder', ReminderSchema);
