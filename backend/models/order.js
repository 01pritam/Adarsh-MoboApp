const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    default: () => `ORD${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  },
  
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  items: [{
    productId: Number,
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    image: String,
     category: {
      type: String,
      enum: ['food', 'medicine', 'groceries'],
      default: 'food' // ✅ Default category
    },
    poweredBy: String // Swiggy, PharmEasy, Blinkit
  }],
  
  totalAmount: {
    type: Number,
    required: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  paymentMethod: {
    type: String,
    enum: ['wallet', 'cash', 'card', 'upi'],
    default: 'wallet'
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    landmark: String
  },
  
  estimatedDelivery: {
    type: String,
    default: '30-45 mins'
  },
  
  actualDeliveryTime: Date,
  
  // Voice order specific fields
  voiceOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  placedViaVoice: {
    type: Boolean,
    default: false
  },
  
  originalTranscript: String,
  
  // Tracking
  orderPlacedAt: {
    type: Date,
    default: Date.now
  },
  
  confirmedAt: Date,
  deliveredAt: Date,
  
  // Additional info
  specialInstructions: String,
  contactNumber: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ status: 1 });

// Update timestamp on save
OrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance methods
OrderSchema.methods.markDelivered = function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  return this.save();
};

OrderSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  return this.save();
};

// Static methods
OrderSchema.statics.getUserOrders = function(userId, options = {}) {
  const { page = 1, limit = 20, status } = options;
  
  const query = { userId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
};

module.exports = mongoose.model('Order', OrderSchema);
