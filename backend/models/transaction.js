const mongoose = require('mongoose');
const { Schema } = mongoose;

const TransactionSchema = new Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    default: () => `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  
  // User references
  fromUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true // Not required for deposits/withdrawals
  },
  
  // Transaction details
type: {
    type: String,
    enum: [
      'credit', 
      'debit', 
      'transfer', 
      'family_topup',    // ✅ ADD THIS
      'wallet_topup',
      'payment',
      'refund'
    ],
    default: 'credit',
    required: true
  },
  
  category: {
    type: String,
    enum: [
      'wallet_topup',
      'family_transfer',
      'family_support',   // ✅ ADD THIS
      'payment',
      'refund',
      'shopping',
      'healthcare',
      'emergency'
    ],
    default: 'wallet_topup',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Status and metadata
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  description: {
    type: String,
    maxlength: 500
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  
  // Payment details
  paymentMethod: {
    type: String,
    enum: ['wallet', 'bank_transfer', 'upi', 'card', 'cash'],
    default: 'wallet'
  },
  paymentGateway: {
    gatewayName: String,
    gatewayTransactionId: String,
    gatewayResponse: Schema.Types.Mixed
  },
  
  // Balance tracking
  balanceBefore: {
    fromUserBalance: Number,
    toUserBalance: Number
  },
  balanceAfter: {
    fromUserBalance: Number,
    toUserBalance: Number
  },
  
  // Timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  failedAt: Date,
  
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceInfo: String,
    location: {
      latitude: Number,
      longitude: Number
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

// Indexes for efficient queries
TransactionSchema.index({ fromUser: 1, createdAt: -1 });
TransactionSchema.index({ toUser: 1, createdAt: -1 });
TransactionSchema.index({ transactionId: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ type: 1, category: 1 });
TransactionSchema.index({ createdAt: -1 });

// Update timestamp on save
TransactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance methods
TransactionSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

TransactionSchema.methods.markFailed = function(reason) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.notes = reason;
  return this.save();
};

// Static methods
TransactionSchema.statics.getUserTransactions = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    type,
    status,
    startDate,
    endDate
  } = options;
  
  const query = {
    $or: [
      { fromUser: userId },
      { toUser: userId }
    ]
  };
  
  if (type) query.type = type;
  if (status) query.status = status;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .populate('fromUser', 'name email role')
    .populate('toUser', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
};

TransactionSchema.statics.getTransactionStats = function(userId, period = '30d') {
  const startDate = new Date();
  if (period === '7d') startDate.setDate(startDate.getDate() - 7);
  else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
  else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
  
  return this.aggregate([
    {
      $match: {
        $or: [{ fromUser: userId }, { toUser: userId }],
        createdAt: { $gte: startDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalSent: {
          $sum: {
            $cond: [
              { $eq: ['$fromUser', userId] },
              '$amount',
              0
            ]
          }
        },
        totalReceived: {
          $sum: {
            $cond: [
              { $eq: ['$toUser', userId] },
              '$amount',
              0
            ]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Transaction', TransactionSchema);
