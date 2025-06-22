// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const GroupSchema = new Schema({
//   name: { 
//     type: String, 
//     required: true,
//     trim: true,
//     maxlength: 100
//   },
//   description: {
//     type: String,
//     trim: true,
//     maxlength: 500
//   },
//   createdBy: { 
//     type: Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true 
//   },
//   members: [{
//     userId: { 
//       type: Schema.Types.ObjectId, 
//       ref: 'User', 
//       required: true 
//     },
//     role: {
//       type: String,
//       enum: ['admin', 'member'],
//       default: 'member'
//     },
//     addedBy: {
//       type: Schema.Types.ObjectId,
//       ref: 'User'
//     },
//     addedAt: {
//       type: Date,
//       default: Date.now
//     }
//   }],
//   groupType: {
//     type: String,
//     enum: ['family', 'caregivers', 'friends', 'mixed'],
//     default: 'family'
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   settings: {
//     allowMemberInvite: { type: Boolean, default: false },
//     requireApproval: { type: Boolean, default: true },
//     maxMembers: { type: Number, default: 20 }
//   },
//   createdAt: { 
//     type: Date, 
//     default: Date.now 
//   },
//   updatedAt: { 
//     type: Date, 
//     default: Date.now 
//   }
// });

// // Update the updatedAt field before saving
// GroupSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// // Index for efficient queries
// GroupSchema.index({ createdBy: 1 });
// GroupSchema.index({ 'members.userId': 1 });
// GroupSchema.index({ isActive: 1 });

// // Check if user is member of group
// GroupSchema.methods.isMember = function(userId) {
//   return this.members.some(member => member.userId.toString() === userId.toString());
// };

// // Check if user is admin of group
// GroupSchema.methods.isAdmin = function(userId) {
//   return this.members.some(member => 
//     member.userId.toString() === userId.toString() && member.role === 'admin'
//   ) || this.createdBy.toString() === userId.toString();
// };

// // Get member count
// GroupSchema.methods.getMemberCount = function() {
//   return this.members.length;
// };

// // Static method to find groups by user
// GroupSchema.statics.findByUser = function(userId) {
//   return this.find({
//     $or: [
//       { createdBy: userId },
//       { 'members.userId': userId }
//     ],
//     isActive: true
//   }).populate('createdBy', 'name email')
//     .populate('members.userId', 'name email role');
// };

// module.exports = mongoose.model('Group', GroupSchema);



const mongoose = require('mongoose');
const { Schema } = mongoose;

const GroupSchema = new Schema({
  name: { 
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
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  members: [{
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
 role: {
  type: String,
 enum: ['elderly', 'family_member', 'caregiver', 'admin','member'],
   default: 'member'
},
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  groupType: {
    type: String,
    enum: ['family', 'caregivers', 'friends', 'mixed'],
    default: 'family'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowMemberInvite: { type: Boolean, default: false },
    requireApproval: { type: Boolean, default: true },
    maxMembers: { type: Number, default: 20 }
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
GroupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
GroupSchema.index({ createdBy: 1 });
GroupSchema.index({ 'members.userId': 1 });
GroupSchema.index({ isActive: 1 });

// ✅ FIXED: Check if user is member of group - handles both populated and non-populated data
GroupSchema.methods.isMember = function(userId) {
  console.log('🔍 isMember method called with userId:', userId);
  console.log('🔍 userId type:', typeof userId);
  
  const userIdStr = userId.toString();
  console.log('🔍 userId as string:', userIdStr);
  
  const isMember = this.members.some(member => {
    // Handle both populated and non-populated member.userId
    let memberIdStr;
    if (member.userId._id) {
      // If populated, member.userId is an object with _id
      memberIdStr = member.userId._id.toString();
    } else {
      // If not populated, member.userId is just the ObjectId
      memberIdStr = member.userId.toString();
    }
    
    console.log(`🔍 Checking member: ${memberIdStr} === ${userIdStr} = ${memberIdStr === userIdStr}`);
    return memberIdStr === userIdStr;
  });
  
  console.log('🔍 isMember result:', isMember);
  return isMember;
};

// ✅ FIXED: Check if user is admin of group - handles both populated and non-populated data
GroupSchema.methods.isAdmin = function(userId) {
  console.log('🔍 isAdmin method called with userId:', userId);
  
  const userIdStr = userId.toString();
  
  // Check if user is the creator
  const isCreator = this.createdBy.toString() === userIdStr;
  console.log('🔍 Is creator?', isCreator);
  
  // Check if user is an admin member
  const isAdminMember = this.members.some(member => {
    let memberIdStr;
    if (member.userId._id) {
      memberIdStr = member.userId._id.toString();
    } else {
      memberIdStr = member.userId.toString();
    }
    
    const isMatch = memberIdStr === userIdStr && member.role === 'admin';
    console.log(`🔍 Checking admin member: ${memberIdStr} === ${userIdStr} && role=${member.role} = ${isMatch}`);
    return isMatch;
  });
  
  const result = isCreator || isAdminMember;
  console.log('🔍 isAdmin result:', result);
  return result;
};

// Get member count
GroupSchema.methods.getMemberCount = function() {
  return this.members.length;
};

// Static method to find groups by user
GroupSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { createdBy: userId },
      { 'members.userId': userId }
    ],
    isActive: true
  }).populate('createdBy', 'name email')
    .populate('members.userId', 'name email role');
};

module.exports = mongoose.model('Group', GroupSchema);
