const Transaction = require('../models/transaction');
const UserProfile = require('../models/profile');
const User = require('../models/user');
const Group = require('../models/group');
const mongoose = require('mongoose');

// Get user transactions with pagination and filters
const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      page = 1, 
      limit = 20, 
      type, 
      status, 
      startDate, 
      endDate,
      category 
    } = req.query;

    // Build query
    const query = {
      $or: [{ fromUser: userId }, { toUser: userId }]
    };

    if (type) query.type = type;
    if (status) query.status = status;
    if (category) query.category = category;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('fromUser', 'name email role')
      .populate('toUser', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalTransactions = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalTransactions / parseInt(limit)),
          totalTransactions,
          hasNext: parseInt(page) * parseInt(limit) < totalTransactions,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// Send money with MongoDB transaction
const sendMoney = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const senderId = req.user.userId;
    const { recipientId, amount, description, category = 'family_transfer' } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required'
      });
    }

    if (senderId === recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send money to yourself'
      });
    }

    await session.withTransaction(async () => {
      // Get sender and recipient profiles
      const [senderProfile, recipientProfile] = await Promise.all([
        UserProfile.findOne({ userId: senderId }).session(session),
        UserProfile.findOne({ userId: recipientId }).session(session)
      ]);

      if (!senderProfile || !recipientProfile) {
        throw new Error('User profile not found');
      }

      // Check balance
      if (senderProfile.wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Create transaction record
      const transaction = new Transaction({
        fromUser: senderId,
        toUser: recipientId,
        type: 'transfer',
        category: category,
        amount: amount,
        description: description || 'Money transfer',
        balanceBefore: {
          fromUserBalance: senderProfile.wallet.balance,
          toUserBalance: recipientProfile.wallet.balance
        },
        status: 'completed',
        completedAt: new Date()
      });

      // Update balances
      senderProfile.wallet.balance -= amount;
      senderProfile.wallet.lastTransactionAt = new Date();
      
      recipientProfile.wallet.balance += amount;
      recipientProfile.wallet.lastTransactionAt = new Date();

      transaction.balanceAfter = {
        fromUserBalance: senderProfile.wallet.balance,
        toUserBalance: recipientProfile.wallet.balance
      };

      // Save everything in transaction
      await Promise.all([
        transaction.save({ session }),
        senderProfile.save({ session }),
        recipientProfile.save({ session })
      ]);

      res.status(200).json({
        success: true,
        message: 'Money sent successfully',
        data: {
          transaction,
          senderNewBalance: senderProfile.wallet.balance,
          recipientNewBalance: recipientProfile.wallet.balance
        }
      });
    });

  } catch (error) {
    console.error('Error sending money:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending money'
    });
  } finally {
    await session.endSession();
  }
};

// Add money to wallet
const addMoney = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      amount, 
      paymentMethod = 'bank_transfer', 
      gatewayTransactionId,
      description 
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Create transaction
    const transaction = new Transaction({
      fromUser: userId,
      type: 'credit',
      category: 'wallet_topup',
      amount: amount,
      description: description || `Wallet top-up via ${paymentMethod}`,
      paymentMethod: paymentMethod,
      balanceBefore: {
        fromUserBalance: profile.wallet.balance
      },
      paymentGateway: {
        gatewayTransactionId: gatewayTransactionId
      },
      status: 'completed',
      completedAt: new Date()
    });

    // Update balance
    profile.wallet.balance += amount;
    profile.wallet.lastTransactionAt = new Date();
    
    transaction.balanceAfter = {
      fromUserBalance: profile.wallet.balance
    };

    await Promise.all([
      transaction.save(),
      profile.save()
    ]);

    res.status(200).json({
      success: true,
      message: 'Money added successfully',
      data: {
        transaction,
        newBalance: profile.wallet.balance
      }
    });

  } catch (error) {
    console.error('Error adding money:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding money',
      error: error.message
    });
  }
};



// const addMoneyToElderlyWallet = async (req, res) => {
//   const session = await mongoose.startSession();
  
//   try {
//     const familyMemberId = req.user.userId; // The family member adding money
//     const { 
//       elderlyUserId,
//       amount, 
//       paymentMethod = 'bank_transfer', 
//       gatewayTransactionId,
//       description,
//       senderNote
//     } = req.body;

//     // Validation
//     if (!amount || amount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid amount. Amount must be greater than 0'
//       });
//     }

//     if (!elderlyUserId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Elderly user ID is required'
//       });
//     }

//     if (familyMemberId === elderlyUserId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Cannot add money to your own wallet using this endpoint'
//       });
//     }

//     await session.withTransaction(async () => {
//       // Get family member and elderly user profiles
//       const [familyMemberProfile, elderlyProfile, familyMemberUser, elderlyUser] = await Promise.all([
//         UserProfile.findOne({ userId: familyMemberId }).session(session),
//         UserProfile.findOne({ userId: elderlyUserId }).session(session),
//         User.findById(familyMemberId).session(session),
//         User.findById(elderlyUserId).session(session)
//       ]);

//       if (!familyMemberProfile || !elderlyProfile) {
//         throw new Error('User profile not found');
//       }

//       if (!familyMemberUser || !elderlyUser) {
//         throw new Error('User not found');
//       }

//       // Verify the elderly user is actually elderly role
//       if (elderlyUser.role !== 'elderly') {
//         throw new Error('Recipient must be an elderly user');
//       }

//       // Verify family relationship (check if they're in the same group)
//       const isInSameGroup = await verifyFamilyRelationship(familyMemberId, elderlyUserId);
//       if (!isInSameGroup) {
//         throw new Error('You can only add money to family members in your group');
//       }

//       // Create transaction record
//       const transaction = new Transaction({
//         fromUser: familyMemberId,
//         toUser: elderlyUserId,
//         type: 'family_topup',
//         category: 'family_support',
//         amount: amount,
//         description: description || `Family support from ${familyMemberUser.name}`,
//         paymentMethod: paymentMethod,
//         balanceBefore: {
//           fromUserBalance: familyMemberProfile.wallet?.balance || 0,
//           toUserBalance: elderlyProfile.wallet.balance
//         },
//         paymentGateway: {
//           gatewayTransactionId: gatewayTransactionId || `FAM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
//         },
//         metadata: {
//           senderNote: senderNote,
//           senderName: familyMemberUser.name,
//           recipientName: elderlyUser.name,
//           addedByFamily: true
//         },
//         status: 'completed',
//         completedAt: new Date()
//       });

//       // Update elderly user's balance
//       elderlyProfile.wallet.balance += amount;
//       elderlyProfile.wallet.lastTransactionAt = new Date();
      
//       // Update activity stats
//       elderlyProfile.activityStats.totalMessages += 1;
//       elderlyProfile.activityStats.lastActive = new Date();

//       transaction.balanceAfter = {
//         fromUserBalance: familyMemberProfile.wallet?.balance || 0,
//         toUserBalance: elderlyProfile.wallet.balance
//       };

//       // Save everything in transaction
//       await Promise.all([
//         transaction.save({ session }),
//         elderlyProfile.save({ session })
//       ]);

//       res.status(200).json({
//         success: true,
//         message: `Money added successfully to ${elderlyUser.name}'s wallet`,
//         data: {
//           transaction: {
//             id: transaction._id,
//             amount: transaction.amount,
//             description: transaction.description,
//             senderNote: senderNote,
//             createdAt: transaction.createdAt,
//             status: transaction.status
//           },
//           recipient: {
//             name: elderlyUser.name,
//             newBalance: elderlyProfile.wallet.balance
//           },
//           sender: {
//             name: familyMemberUser.name,
//             role: familyMemberUser.role
//           }
//         }
//       });
//     });

//   } catch (error) {
//     console.error('Error adding money to elderly wallet:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Error adding money to elderly wallet'
//     });
//   } finally {
//     await session.endSession();
//   }
// };





// ✅ HELPER: Verify family relationship


// ✅ UPDATED: addMoneyToElderlyWallet function with balance deduction
const addMoneyToElderlyWallet = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const familyMemberId = req.user.userId;
    const { 
      elderlyUserId,
      amount, 
      paymentMethod = 'wallet_transfer', // ✅ Changed default
      gatewayTransactionId,
      description,
      senderNote
    } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Amount must be greater than 0'
      });
    }

    if (!elderlyUserId) {
      return res.status(400).json({
        success: false,
        message: 'Elderly user ID is required'
      });
    }

    if (familyMemberId === elderlyUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add money to your own wallet using this endpoint'
      });
    }

    await session.withTransaction(async () => {
      // Get family member and elderly user profiles
      const [familyMemberProfile, elderlyProfile, familyMemberUser, elderlyUser] = await Promise.all([
        UserProfile.findOne({ userId: familyMemberId }).session(session),
        UserProfile.findOne({ userId: elderlyUserId }).session(session),
        User.findById(familyMemberId).session(session),
        User.findById(elderlyUserId).session(session)
      ]);

      if (!familyMemberProfile || !elderlyProfile) {
        throw new Error('User profile not found');
      }

      if (!familyMemberUser || !elderlyUser) {
        throw new Error('User not found');
      }

      // ✅ NEW: Check if family member has sufficient balance
      if (familyMemberProfile.wallet.balance < amount) {
        throw new Error(`Insufficient balance. You have ₹${familyMemberProfile.wallet.balance} but need ₹${amount}`);
      }

      // Verify the elderly user is actually elderly role
      if (elderlyUser.role !== 'elderly') {
        throw new Error('Recipient must be an elderly user');
      }

      // Verify family relationship
      const isInSameGroup = await verifyFamilyRelationship(familyMemberId, elderlyUserId);
      if (!isInSameGroup) {
        throw new Error('You can only add money to family members in your group');
      }

      // ✅ NEW: Create debit transaction for family member
      const debitTransaction = new Transaction({
        fromUser: familyMemberId,
        toUser: elderlyUserId,
        type: 'debit',
        category: 'family_transfer',
        amount: amount,
        description: description || `Money sent to ${elderlyUser.name}`,
        paymentMethod: paymentMethod,
        balanceBefore: {
          fromUserBalance: familyMemberProfile.wallet.balance,
          toUserBalance: elderlyProfile.wallet.balance
        },
        paymentGateway: {
          gatewayTransactionId: gatewayTransactionId || `DEBIT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        metadata: {
          senderNote: senderNote,
          senderName: familyMemberUser.name,
          recipientName: elderlyUser.name,
          transferType: 'family_support'
        },
        status: 'completed',
        completedAt: new Date()
      });

      // ✅ NEW: Create credit transaction for elderly user
      const creditTransaction = new Transaction({
        fromUser: familyMemberId,
        toUser: elderlyUserId,
        type: 'credit',
        category: 'family_transfer',
        amount: amount,
        description: description || `Money received from ${familyMemberUser.name}`,
        paymentMethod: paymentMethod,
        balanceBefore: {
          fromUserBalance: familyMemberProfile.wallet.balance,
          toUserBalance: elderlyProfile.wallet.balance
        },
        paymentGateway: {
          gatewayTransactionId: gatewayTransactionId || `CREDIT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        metadata: {
          senderNote: senderNote,
          senderName: familyMemberUser.name,
          recipientName: elderlyUser.name,
          transferType: 'family_support'
        },
        status: 'completed',
        completedAt: new Date()
      });

      // ✅ NEW: Update both balances
      familyMemberProfile.wallet.balance -= amount; // Deduct from sender
      elderlyProfile.wallet.balance += amount;       // Add to recipient
      
      familyMemberProfile.wallet.lastTransactionAt = new Date();
      elderlyProfile.wallet.lastTransactionAt = new Date();
      
      // Update activity stats
      elderlyProfile.activityStats.totalMessages += 1;
      elderlyProfile.activityStats.lastActive = new Date();

      // Update transaction balance after
      debitTransaction.balanceAfter = {
        fromUserBalance: familyMemberProfile.wallet.balance,
        toUserBalance: elderlyProfile.wallet.balance
      };

      creditTransaction.balanceAfter = {
        fromUserBalance: familyMemberProfile.wallet.balance,
        toUserBalance: elderlyProfile.wallet.balance
      };

      // ✅ NEW: Save both transactions and profiles
      await Promise.all([
        debitTransaction.save({ session }),
        creditTransaction.save({ session }),
        familyMemberProfile.save({ session }),
        elderlyProfile.save({ session })
      ]);

      res.status(200).json({
        success: true,
        message: `Money transferred successfully to ${elderlyUser.name}'s wallet`,
        data: {
          debitTransaction: {
            id: debitTransaction._id,
            amount: debitTransaction.amount,
            type: 'debit'
          },
          creditTransaction: {
            id: creditTransaction._id,
            amount: creditTransaction.amount,
            type: 'credit'
          },
          sender: {
            name: familyMemberUser.name,
            newBalance: familyMemberProfile.wallet.balance
          },
          recipient: {
            name: elderlyUser.name,
            newBalance: elderlyProfile.wallet.balance
          }
        }
      });
    });

  } catch (error) {
    console.error('Error transferring money to elderly wallet:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error transferring money to elderly wallet'
    });
  } finally {
    await session.endSession();
  }
};



const verifyFamilyRelationship = async (familyMemberId, elderlyUserId) => {
  try {
    console.log('👥 =================================');
    console.log('👥 VERIFYING FAMILY RELATIONSHIP');
    console.log('👥 Family Member ID:', familyMemberId);
    console.log('👥 Elderly User ID:', elderlyUserId);
    console.log('👥 Family Member ID type:', typeof familyMemberId);
    console.log('👥 Elderly User ID type:', typeof elderlyUserId);
    console.log('👥 =================================');
    
    // ✅ STEP 1: Fetch family member profile
    console.log('🔍 STEP 1: Fetching family member profile...');
    const familyMemberProfile = await UserProfile.findOne({ userId: familyMemberId })
      .populate('groupInfo.activeGroups.groupId');

    console.log('👤 Family member profile found:', !!familyMemberProfile);
    
    if (!familyMemberProfile) {
      console.log('❌ Family member profile not found');
      return false;
    }

    // ✅ STEP 2: Check groupInfo structure
    console.log('🔍 STEP 2: Checking groupInfo structure...');
    console.log('👥 Has groupInfo:', !!familyMemberProfile.groupInfo);
    console.log('👥 Has activeGroups:', !!familyMemberProfile.groupInfo?.activeGroups);
    console.log('👥 Active groups count:', familyMemberProfile.groupInfo?.activeGroups?.length || 0);

    if (!familyMemberProfile.groupInfo || !familyMemberProfile.groupInfo.activeGroups) {
      console.log('❌ No groupInfo or activeGroups found');
      return false;
    }

    // ✅ STEP 3: Iterate through groups with detailed logging
    console.log('🔍 STEP 3: Checking each group...');
    
    for (let i = 0; i < familyMemberProfile.groupInfo.activeGroups.length; i++) {
      const group = familyMemberProfile.groupInfo.activeGroups[i];
      
      console.log(`\n📋 Group ${i + 1}:`);
      console.log(`📋 Group isActive:`, group.isActive);
      console.log(`📋 Has groupId:`, !!group.groupId);
      console.log(`📋 GroupId type:`, typeof group.groupId);
      
      if (group.groupId) {
        console.log(`📋 GroupId._id:`, group.groupId._id);
        console.log(`📋 GroupId.name:`, group.groupId.name);
        console.log(`📋 Has members:`, !!group.groupId.members);
        console.log(`📋 Members count:`, group.groupId.members?.length || 0);
      }
      
      // Only check active groups
      if (group.isActive && group.groupId && group.groupId.members) {
        console.log(`👥 Processing group members...`);
        
        const memberIds = group.groupId.members.map((member, memberIndex) => {
          const memberId = member.userId.toString();
          console.log(`  Member ${memberIndex + 1}: ${memberId} (type: ${typeof member.userId})`);
          return memberId;
        });
        
        console.log(`👥 All member IDs:`, memberIds);
        console.log(`👥 Looking for elderly user:`, elderlyUserId);
        console.log(`👥 Elderly user in members:`, memberIds.includes(elderlyUserId));
        
        if (memberIds.includes(elderlyUserId)) {
          console.log('✅ FAMILY RELATIONSHIP VERIFIED!');
          console.log('✅ Found in group:', group.groupId.name);
          return true;
        }
      } else {
        console.log(`⏭️ Skipping group ${i + 1} (inactive or no members)`);
      }
    }

    console.log('❌ FAMILY RELATIONSHIP NOT FOUND');
    console.log('❌ Elderly user not found in any active groups');
    return false;
    
  } catch (error) {
    console.error('💥 Error verifying family relationship:', error);
    console.error('💥 Error stack:', error.stack);
    return false;
  }
};


// ✅ NEW: Get elderly family members (for family to choose who to add money to)
// const getElderlyFamilyMembers = async (req, res) => {
//   try {
//     const familyMemberId = req.user.userId;
    
//     // Get family member's groups to find elderly members
//     const profile = await UserProfile.findOne({ userId: familyMemberId })
//       .populate({
//         path: 'groupInfo.activeGroups.groupId',
//         populate: {
//           path: 'members.userId',
//           select: 'name email role'
//         }
//       });

//     if (!profile) {
//       return res.status(404).json({
//         success: false,
//         message: 'Profile not found'
//       });
//     }

//     // Extract elderly family members
//     const elderlyMembers = new Set();
    
//     profile.groupInfo.activeGroups.forEach(group => {
//       if (group.groupId && group.groupId.members) {
//         group.groupId.members.forEach(member => {
//           if (member.userId._id.toString() !== familyMemberId && 
//               member.userId.role === 'elderly') {
//             elderlyMembers.add(JSON.stringify({
//               id: member.userId._id,
//               name: member.userId.name,
//               email: member.userId.email,
//               role: member.userId.role
//             }));
//           }
//         });
//       }
//     });

//     const uniqueElderlyMembers = Array.from(elderlyMembers).map(member => JSON.parse(member));

//     res.status(200).json({
//       success: true,
//       message: 'Elderly family members retrieved successfully',
//       data: {
//         elderlyMembers: uniqueElderlyMembers,
//         totalCount: uniqueElderlyMembers.length
//       }
//     });

//   } catch (error) {
//     console.error('Error fetching elderly family members:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching elderly family members',
//       error: error.message
//     });
//   }
// };



const getElderlyFamilyMembers = async (req, res) => {
  try {
    const familyMemberId = req.user.userId;
    console.log('👴 =================================');
    console.log('👴 Getting elderly family members for user:', familyMemberId);
    console.log('👴 User ID type:', typeof familyMemberId);
    console.log('👴 =================================');
    
    // ✅ STEP 1: Get both User and UserProfile data
    console.log('🔍 STEP 1: Fetching user and profile data...');
    
    const [user, profile] = await Promise.all([
      User.findById(familyMemberId).populate('groups'),
      UserProfile.findOne({ userId: familyMemberId })
    ]);

    console.log('👤 User found:', !!user);
    console.log('👤 User groups (from User model):', user?.groups?.length || 0);
    console.log('📋 Profile found:', !!profile);
    console.log('📋 Profile activeGroups:', profile?.groupInfo?.activeGroups?.length || 0);

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ✅ STEP 2: Collect all group IDs from both sources
    console.log('🔍 STEP 2: Collecting group IDs from all sources...');
    
    const allGroupIds = new Set();
    
    // From User model groups array
    if (user.groups && user.groups.length > 0) {
      console.log('📋 Processing User.groups array...');
      user.groups.forEach((groupId, index) => {
        const id = groupId._id || groupId;
        console.log(`  Group ${index}: ${id}`);
        allGroupIds.add(id.toString());
      });
    }
    
    // From UserProfile groupInfo.activeGroups
    if (profile?.groupInfo?.activeGroups && profile.groupInfo.activeGroups.length > 0) {
      console.log('📋 Processing UserProfile.groupInfo.activeGroups...');
      profile.groupInfo.activeGroups.forEach((groupEntry, index) => {
        if (groupEntry.isActive && groupEntry.groupId) {
          const id = groupEntry.groupId._id || groupEntry.groupId;
          console.log(`  Active Group ${index}: ${id}`);
          allGroupIds.add(id.toString());
        }
      });
    }

    const uniqueGroupIds = Array.from(allGroupIds);
    console.log('🎯 Total unique group IDs found:', uniqueGroupIds.length);
    console.log('🎯 Group IDs:', uniqueGroupIds);

    if (uniqueGroupIds.length === 0) {
      console.log('❌ User is not in any groups');
      return res.status(200).json({
        success: true,
        message: 'User is not in any groups',
        data: {
          elderlyMembers: [],
          totalCount: 0,
          debug: {
            userGroupsCount: user.groups?.length || 0,
            profileActiveGroupsCount: profile?.groupInfo?.activeGroups?.length || 0
          }
        }
      });
    }

    // ✅ STEP 3: Fetch all groups with populated members
    console.log('🔍 STEP 3: Fetching groups with populated members...');
    
    const groups = await Group.find({
      _id: { $in: uniqueGroupIds },
      isActive: true
    }).populate({
      path: 'members.userId',
      select: 'name email role'
    });
    
    console.log('📋 Groups found in database:', groups.length);
    
    groups.forEach((group, index) => {
      console.log(`📋 Group ${index}:`, {
        id: group._id,
        name: group.name,
        membersCount: group.members?.length || 0,
        isActive: group.isActive
      });
    });

    // ✅ STEP 4: Extract elderly members with detailed logging
    console.log('🔍 STEP 4: Extracting elderly members...');
    
    const elderlyMembers = new Map();
    let totalMembersProcessed = 0;
    let elderlyMembersFound = 0;
    let selfEncounters = 0;

    groups.forEach((group, groupIndex) => {
      console.log(`\n🏠 Processing Group ${groupIndex}: "${group.name}"`);
      console.log(`🏠 Group ID: ${group._id}`);
      console.log(`🏠 Members count: ${group.members?.length || 0}`);
      
      if (!group.members || group.members.length === 0) {
        console.log('⚠️ Group has no members');
        return;
      }

      group.members.forEach((member, memberIndex) => {
        totalMembersProcessed++;
        
        console.log(`\n  👤 Member ${memberIndex}:`);
        console.log(`  👤 Raw member data:`, {
          userId: member.userId,
          role: member.role,
          addedAt: member.addedAt
        });
        
        if (!member.userId) {
          console.log('  ❌ Member has no userId');
          return;
        }

        // Handle both populated and non-populated userId
        let memberUserId, memberName, memberEmail, memberRole;
        
        if (typeof member.userId === 'object' && member.userId._id) {
          // Populated
          memberUserId = member.userId._id.toString();
          memberName = member.userId.name;
          memberEmail = member.userId.email;
          memberRole = member.userId.role;
          console.log('  📋 Member data (populated):', {
            id: memberUserId,
            name: memberName,
            email: memberEmail,
            role: memberRole
          });
        } else {
          // Not populated - just ObjectId
          memberUserId = member.userId.toString();
          memberName = 'Unknown';
          memberEmail = 'Unknown';
          memberRole = 'Unknown';
          console.log('  ⚠️ Member data (not populated):', {
            id: memberUserId,
            note: 'User data not populated'
          });
        }

        // Check if this is the current user
        if (memberUserId === familyMemberId) {
          selfEncounters++;
          console.log('  ⏭️ Skipping self (current user)');
          return;
        }

        // Check if this is an elderly member
        if (memberRole === 'elderly') {
          elderlyMembersFound++;
          console.log('  ✅ Found elderly member!');
          
          const elderlyMemberData = {
            id: memberUserId,
            name: memberName,
            email: memberEmail,
            role: memberRole,
            groupName: group.name,
            groupId: group._id
          };
          
          elderlyMembers.set(memberUserId, elderlyMemberData);
          console.log('  💾 Added to elderly members collection');
        } else {
          console.log(`  ⏭️ Skipping non-elderly member (role: ${memberRole})`);
        }
      });
    });

    // ✅ STEP 5: Prepare final result
    console.log('\n🎯 FINAL PROCESSING:');
    console.log('🎯 Total members processed:', totalMembersProcessed);
    console.log('🎯 Self encounters:', selfEncounters);
    console.log('🎯 Elderly members found:', elderlyMembersFound);
    console.log('🎯 Unique elderly members:', elderlyMembers.size);

    const uniqueElderlyMembers = Array.from(elderlyMembers.values());
    
    console.log('\n📊 RESULT SUMMARY:');
    uniqueElderlyMembers.forEach((member, index) => {
      console.log(`  ${index + 1}. ${member.name} (${member.email}) - Group: ${member.groupName}`);
    });

    // ✅ STEP 6: Return response
    const response = {
      success: true,
      message: uniqueElderlyMembers.length > 0 
        ? 'Elderly family members retrieved successfully'
        : 'No elderly family members found',
      data: {
        elderlyMembers: uniqueElderlyMembers.map(member => ({
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role
        })),
        totalCount: uniqueElderlyMembers.length
      },
      debug: {
        userGroupsCount: user.groups?.length || 0,
        profileActiveGroupsCount: profile?.groupInfo?.activeGroups?.length || 0,
        totalGroupsFound: groups.length,
        totalMembersProcessed,
        elderlyMembersFound,
        selfEncounters,
        uniqueElderlyMembers: elderlyMembers.size
      }
    };

    console.log('\n✅ Sending response:', {
      success: response.success,
      elderlyCount: response.data.totalCount,
      debugInfo: response.debug
    });

    res.status(200).json(response);

  } catch (error) {
    console.error('\n💥 ERROR in getElderlyFamilyMembers:');
    console.error('💥 Error name:', error.name);
    console.error('💥 Error message:', error.message);
    console.error('💥 Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Error fetching elderly family members',
      error: error.message,
      debug: {
        errorName: error.name,
        timestamp: new Date().toISOString()
      }
    });
  }
};





// Get transaction statistics
const getTransactionStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period = '30d' } = req.query;

    let startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
    else if (period === '1y') startDate.setFullYear(startDate.getFullYear() - 1);

    const stats = await Transaction.aggregate([
      {
        $match: {
          $or: [{ fromUser: new mongoose.Types.ObjectId(userId) }, { toUser: new mongoose.Types.ObjectId(userId) }],
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
                { $eq: ['$fromUser', new mongoose.Types.ObjectId(userId)] },
                '$amount',
                0
              ]
            }
          },
          totalReceived: {
            $sum: {
              $cond: [
                { $eq: ['$toUser', new mongoose.Types.ObjectId(userId)] },
                '$amount',
                0
              ]
            }
          },
          avgTransactionAmount: { $avg: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Transaction statistics retrieved successfully',
      data: {
        period,
        stats: stats[0] || {
          totalTransactions: 0,
          totalSent: 0,
          totalReceived: 0,
          avgTransactionAmount: 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction statistics',
      error: error.message
    });
  }
};

// Get family members for money transfer
const getFamilyMembers = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's groups to find family members
    const profile = await UserProfile.findOne({ userId })
      .populate({
        path: 'groupInfo.activeGroups.groupId',
        populate: {
          path: 'members.userId',
          select: 'name email role'
        }
      });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Extract unique family members
    const familyMembers = new Set();
    
    profile.groupInfo.activeGroups.forEach(group => {
      if (group.groupId && group.groupId.members) {
        group.groupId.members.forEach(member => {
          if (member.userId._id.toString() !== userId) {
            familyMembers.add(JSON.stringify({
              id: member.userId._id,
              name: member.userId.name,
              email: member.userId.email,
              role: member.userId.role
            }));
          }
        });
      }
    });

    const uniqueFamilyMembers = Array.from(familyMembers).map(member => JSON.parse(member));

    res.status(200).json({
      success: true,
      message: 'Family members retrieved successfully',
      data: {
        familyMembers: uniqueFamilyMembers
      }
    });

  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching family members',
      error: error.message
    });
  }
};

module.exports = {
  getUserTransactions,
  sendMoney,
  addMoney,
   addMoneyToElderlyWallet, // ✅ NEW
  getElderlyFamilyMembers, // ✅ NEW
  getTransactionStats,
  getFamilyMembers
};
