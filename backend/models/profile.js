const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserProfileSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Personal Information
  personalInfo: {
    dateOfBirth: { type: Date },
    gender: { 
      type: String, 
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say'
    },
    profilePicture: { type: String },
    bio: { type: String, maxlength: 500 },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phoneNumber: { type: String },
      email: { type: String }
    }
  },

  // Address Information
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: true }
  },

  // Language Preferences
  languagePreferences: {
    primary: { 
      type: String, 
      enum: ['english', 'hindi', 'tamil', 'telugu', 'bengali', 'marathi', 'gujarati', 'kannada', 'malayalam', 'punjabi'],
      default: 'english'
    },
    secondary: [{ 
      type: String, 
      enum: ['english', 'hindi', 'tamil', 'telugu', 'bengali', 'marathi', 'gujarati', 'kannada', 'malayalam', 'punjabi']
    }],
    voiceLanguage: { 
      type: String, 
      enum: ['english', 'hindi', 'tamil', 'telugu', 'bengali', 'marathi', 'gujarati', 'kannada', 'malayalam', 'punjabi'],
      default: 'english'
    }
  },

  // ✅ UPDATED: Simplified Wallet (no embedded transactions)
  wallet: {
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    bankAccount: {
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      accountHolderName: { type: String },
      isVerified: { type: Boolean, default: false }
    },
    upiId: { type: String },
    // ✅ REMOVED: transactions array (now in separate collection)
    lastTransactionAt: { type: Date }
  },

  // Health Information (for elderly users)
  healthInfo: {
    bloodGroup: { 
      type: String, 
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    allergies: [{ type: String }],
    medications: [{
      name: { type: String },
      dosage: { type: String },
      frequency: { type: String },
      prescribedBy: { type: String }
    }],
    medicalConditions: [{ type: String }],
    doctorInfo: {
      name: { type: String },
      specialization: { type: String },
      phoneNumber: { type: String },
      hospital: { type: String }
    }
  },

  // App Preferences
  appPreferences: {
    notifications: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      emergencyAlerts: { type: Boolean, default: true }
    },
    privacy: {
      showPhoneNumber: { type: Boolean, default: false },
      showLocation: { type: Boolean, default: true },
      allowFamilyTracking: { type: Boolean, default: true }
    },
    accessibility: {
      fontSize: { 
        type: String, 
        enum: ['small', 'medium', 'large', 'extra_large'],
        default: 'medium'
      },
      highContrast: { type: Boolean, default: false },
      voiceAssistance: { type: Boolean, default: false }
    }
  },

  // Group Information
  groupInfo: {
    activeGroups: [{
      groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
      role: { 
        type: String, 
        enum: ['elderly', 'family_member', 'caregiver', 'admin', 'member']
      },
      joinedAt: { type: Date, default: Date.now },
      isActive: { type: Boolean, default: true }
    }],
    totalGroups: { type: Number, default: 0 },
    favoriteGroups: [{ type: Schema.Types.ObjectId, ref: 'Group' }]
  },

  // ✅ UPDATED: Activity Stats (no transaction count here)
  activityStats: {
    lastActive: { type: Date, default: Date.now },
    totalMessages: { type: Number, default: 0 },
    totalCalls: { type: Number, default: 0 },
    emergencyAlerts: { type: Number, default: 0 }
  },

  // Verification Status
  verification: {
    phoneVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    identityVerified: { type: Boolean, default: false },
    bankAccountVerified: { type: Boolean, default: false }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ✅ UPDATED: Methods now use separate Transaction model
UserProfileSchema.methods.updateBalance = async function(amount, type = 'credit') {
  if (type === 'credit') {
    this.wallet.balance += amount;
  } else if (type === 'debit' && this.wallet.balance >= amount) {
    this.wallet.balance -= amount;
  } else {
    throw new Error('Insufficient balance');
  }
  
  this.wallet.lastTransactionAt = new Date();
  return this.save();
};

module.exports = mongoose.model('UserProfile', UserProfileSchema);
