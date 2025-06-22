
const mongoose = require('mongoose');

const Group = require('../models/group.js');
const User = require('../models/user');

// Create a new group
// const createGroup = async (req, res) => {
//   try {
//     const { name, description, groupType, settings } = req.body;
//     const creatorId = req.user.userId;

//     // Check if user exists
//     const creator = await User.findById(creatorId);
//     if (!creator) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // Create new group
//     const group = new Group({
//       name,
//       description,
//       createdBy: creatorId,
//       groupType: groupType || 'family',
//       settings: settings || {},
//       members: [{
//         userId: creatorId,
//         role: 'admin',
//         addedBy: creatorId,
//         addedAt: new Date()
//       }]
//     });

//     await group.save();

//     // ✅ Add group to creator's groups list if not already added
//     if (!creator.groups.includes(group._id)) {
//       creator.groups.push(group._id);
//       await creator.save();
//     }

//     // Populate the group data
//     await group.populate('createdBy', 'name email');
//     await group.populate('members.userId', 'name email role');

//     res.status(201).json({
//       success: true,
//       message: 'Group created successfully',
//       data: { group }
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error creating group',
//       error: error.message
//     });
//   }
// };

const createGroup = async (req, res) => {
  try {
    const { name, description, groupType, settings } = req.body;
    const creatorId = req.user?.userId;

    // 🔐 Validate required fields
    if (!creatorId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User ID missing in request'
      });
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required and must be a valid string'
      });
    }

    // ✅ Fetch user
    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 🔄 Ensure creator.groups is an array
    if (!Array.isArray(creator.groups)) {
      creator.groups = [];
    }

    // 📦 Create new group
    const group = new Group({
      name: name.trim(),
      description: description?.trim() || '',
      createdBy: creatorId,
      groupType: groupType || 'family',
      settings: settings || {},
      members: [{
        userId: creatorId,
        role: 'admin',
        addedBy: creatorId,
        addedAt: new Date()
      }]
    });

    await group.save();

    // 🧠 Add group to creator’s list if not already present
    if (!creator.groups.includes(group._id)) {
      creator.groups.push(group._id);
      await creator.save();
    }

    // 👥 Populate referenced fields
    await group.populate('createdBy', 'name email');
    await group.populate('members.userId', 'name email role');

    // ✅ Respond
    return res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: { group }
    });

  } catch (error) {
    console.error('🔥 Error in createGroup:', error); // Helpful in dev logs
    return res.status(500).json({
      success: false,
      message: 'Error creating group',
      error: error.message
    });
  }
};



// Add member to group
const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, role = 'member' } = req.body;
    const requesterId = req.user.userId;

    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if requester is admin
    if (!group.isAdmin(requesterId)) {
      return res.status(403).json({
        success: false,
        message: 'Only group admins can add members'
      });
    }

    // Check if user to be added exists
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: 'User to be added not found'
      });
    }

    // Check if user is already a member
    if (group.isMember(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this group'
      });
    }

    // Check member limit
    if (group.getMemberCount() >= group.settings.maxMembers) {
      return res.status(400).json({
        success: false,
        message: `Group has reached maximum member limit of ${group.settings.maxMembers}`
      });
    }

    // Add member to group
    group.members.push({
      userId: userId,
      role: role,
      addedBy: requesterId,
      addedAt: new Date()
    });

    await group.save();

    // Populate and return updated group
    await group.populate('members.userId', 'name email role');

    res.json({
      success: true,
      message: `${userToAdd.name} added to group successfully`,
      data: { 
        group: {
          id: group._id,
          name: group.name,
          memberCount: group.getMemberCount(),
          members: group.members
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding member to group',
      error: error.message
    });
  }
};

// Remove member from group
const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const requesterId = req.user.userId;

    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if requester is admin or removing themselves
    if (!group.isAdmin(requesterId) && requesterId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only group admins can remove members, or members can remove themselves'
      });
    }

    // Check if user is a member
    if (!group.isMember(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this group'
      });
    }

    // Prevent removing the group creator
    if (group.createdBy.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the group creator'
      });
    }

    // Remove member from group
    group.members = group.members.filter(
      member => member.userId.toString() !== userId
    );

    await group.save();

    // Get removed user info
    const removedUser = await User.findById(userId);

    res.json({
      success: true,
      message: `${removedUser ? removedUser.name : 'User'} removed from group successfully`,
      data: { 
        group: {
          id: group._id,
          name: group.name,
          memberCount: group.getMemberCount()
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing member from group',
      error: error.message
    });
  }
};

// Get group members
// const getGroupMembers = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const requesterId = req.user.userId;

//     // Find the group
//     const group = await Group.findById(groupId)
//       .populate('createdBy', 'name email role')
//       .populate('members.userId', 'name email role phoneNumber')
//       .populate('members.addedBy', 'name');

//     if (!group) {
//       return res.status(404).json({
//         success: false,
//         message: 'Group not found'
//       });
//     }

//     // Check if requester is a member
//     if (!group.isMember(requesterId)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Only group members can view member list'
//       });
//     }

//     res.json({
//       success: true,
//       data: {
//         group: {
//           id: group._id,
//           name: group.name,
//           description: group.description,
//           groupType: group.groupType,
//           createdBy: group.createdBy,
//           memberCount: group.getMemberCount(),
//           members: group.members,
//           createdAt: group.createdAt
//         }
//       }
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching group members',
//       error: error.message
//     });
//   }
// };


const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const requesterId = req.user.userId;

    console.log('🔍 === GROUP MEMBERS REQUEST DEBUG ===');
    console.log('📋 Group ID from params:', groupId);
    console.log('👤 Requester ID from token:', requesterId);
    console.log('👤 Requester ID type:', typeof requesterId);
    console.log('👤 Requester object:', req.user);

    // Find the group
    console.log('🔍 Step 1: Finding group...');
    const group = await Group.findById(groupId)
      .populate('createdBy', 'name email role')
      .populate('members.userId', 'name email role phoneNumber')
      .populate('members.addedBy', 'name');

    if (!group) {
      console.log('❌ Group not found with ID:', groupId);
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    console.log('✅ Group found successfully');
    console.log('📋 Group details:');
    console.log('  - Group ID:', group._id);
    console.log('  - Group name:', group.name);
    console.log('  - Created by:', group.createdBy);
    console.log('  - Members count:', group.members?.length || 0);

    // Debug group members
    console.log('👥 === GROUP MEMBERS DEBUG ===');
    if (group.members && group.members.length > 0) {
      group.members.forEach((member, index) => {
        console.log(`👤 Member ${index + 1}:`);
        console.log('  - Member ID:', member.userId._id);
        console.log('  - Member ID type:', typeof member.userId._id);
        console.log('  - Member ID string:', member.userId._id.toString());
        console.log('  - Member name:', member.userId.name);
        console.log('  - Member role:', member.role);
        console.log('  - Matches requester?:', member.userId._id.toString() === requesterId);
        console.log('  - Matches requester (strict)?:', member.userId._id === requesterId);
      });
    } else {
      console.log('❌ No members found in group');
    }

    // Debug the isMember function
    console.log('🔍 === MEMBERSHIP CHECK DEBUG ===');
    console.log('🔍 Checking if requester is member...');
    console.log('👤 Requester ID for check:', requesterId);
    
    // Manual membership check
    const isManualMember = group.members.some(member => {
      const memberId = member.userId._id.toString();
      const requesterIdStr = requesterId.toString();
      console.log(`🔍 Comparing: ${memberId} === ${requesterIdStr} = ${memberId === requesterIdStr}`);
      return memberId === requesterIdStr;
    });
    
    console.log('🔍 Manual membership check result:', isManualMember);

    // Check if isMember method exists
    if (typeof group.isMember === 'function') {
      console.log('✅ isMember method exists');
      const isMemberResult = group.isMember(requesterId);
      console.log('🔍 isMember method result:', isMemberResult);
    } else {
      console.log('❌ isMember method does not exist on group object');
      console.log('📋 Available group methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(group)));
    }

    // Check if requester is a member (using manual check as fallback)
    const isMember = typeof group.isMember === 'function' 
      ? group.isMember(requesterId) 
      : isManualMember;

    console.log('🔍 Final membership result:', isMember);

    if (!isMember) {
      console.log('❌ MEMBERSHIP CHECK FAILED');
      console.log('❌ Requester is not a member of this group');
      console.log('❌ Possible reasons:');
      console.log('  1. User ID mismatch (string vs ObjectId)');
      console.log('  2. User not actually in the group');
      console.log('  3. isMember method implementation issue');
      console.log('  4. Database inconsistency');
      
      return res.status(403).json({
        success: false,
        message: 'Only group members can view member list',
        debug: {
          requesterId: requesterId,
          groupId: groupId,
          groupMembers: group.members.map(m => ({
            id: m.userId._id.toString(),
            name: m.userId.name
          }))
        }
      });
    }

    console.log('✅ MEMBERSHIP CHECK PASSED');
    console.log('✅ User is authorized to view group members');

    const responseData = {
      success: true,
      data: {
        group: {
          id: group._id,
          name: group.name,
          description: group.description,
          groupType: group.groupType,
          createdBy: group.createdBy,
          memberCount: group.getMemberCount ? group.getMemberCount() : group.members.length,
          members: group.members,
          createdAt: group.createdAt
        }
      }
    };

    console.log('✅ Sending successful response');
    console.log('📊 Response data structure:', {
      success: responseData.success,
      groupId: responseData.data.group.id,
      memberCount: responseData.data.group.memberCount
    });

    res.json(responseData);

  } catch (error) {
    console.log('🚨 === ERROR IN GROUP MEMBERS CONTROLLER ===');
    console.log('❌ Error name:', error.name);
    console.log('❌ Error message:', error.message);
    console.log('❌ Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Error fetching group members',
      error: error.message
    });
  }
};


// Get user's groups
const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.userId;

    const groups = await Group.findByUser(userId);

    res.json({
      success: true,
      data: {
        groups: groups.map(group => ({
          id: group._id,
          name: group.name,
          description: group.description,
          groupType: group.groupType,
          memberCount: group.getMemberCount(),
          isCreator: group.createdBy._id.toString() === userId,
          isAdmin: group.isAdmin(userId),
          createdAt: group.createdAt
        }))
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user groups',
      error: error.message
    });
  }
};

// Delete group
const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const requesterId = req.user.userId;

    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if requester is the creator
    if (group.createdBy.toString() !== requesterId) {
      return res.status(403).json({
        success: false,
        message: 'Only group creator can delete the group'
      });
    }

    // Soft delete by setting isActive to false
    group.isActive = false;
    await group.save();

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting group',
      error: error.message
    });
  }
};


const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.user.userId;

    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is already a member
    const isAlreadyMember = group.members.some(
      member => member.userId.toString() === userId.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group',
      });
    }

    // Check member limit
    if (
      group.settings &&
      group.settings.maxMembers &&
      group.members.length >= group.settings.maxMembers
    ) {
      return res.status(400).json({
        success: false,
        message: `Group has reached the maximum member limit of ${group.settings.maxMembers}`,
      });
    }

    // Add user to group
    // group.members.push({
    //   userId: new mongoose.Types.ObjectId(userId),
    //   role: 'member',
    //   addedBy: new mongoose.Types.ObjectId(userId),
    // });

    // Add user to group
group.members.push({
  userId: new mongoose.Types.ObjectId(userId),
  role: user.role, // ✅ get role from user document
  addedBy: new mongoose.Types.ObjectId(userId),
});


    await group.save();

    // Add group to user's group list if not already present
    const alreadyInGroupList = user.groups.some(
      id => id.toString() === group._id.toString()
    );

    if (!alreadyInGroupList) {
      user.groups.push(group._id);
      await user.save();
    }

    return res.json({
      success: true,
      message: `Successfully joined group "${group.name}"`,
      group,
    });

  } catch (error) {
    console.error('Join group error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error joining group',
      error: error.message,
    });
  }
};

// Get group info by ID (for users to see before joining)
// const getGroupInfo = async (req, res) => {
//   try {
//     const { groupId } = req.params;

//     const group = await Group.findById(groupId)
//       .populate('createdBy', 'name')
//       .select('name description groupType createdBy createdAt members');

//     if (!group) {
//       return res.status(404).json({
//         success: false,
//         message: 'Group not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: {
//         groupId: group._id,
//         name: group.name,
//         description: group.description,
//         groupType: group.groupType,
//         createdBy: group.createdBy.name,
//         memberCount: group.getMemberCount(),
//         createdAt: group.createdAt
//       }
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching group info',
//       error: error.message
//     });
//   }
// };

const getGroupInfo = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('createdBy', 'name email') // include more fields if needed
      .populate('members.userId', 'name email username') // populate member user details
      .exec();

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.json({
      success: true,
      message: 'Group info fetched successfully',
      group: group // send full group object
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching group info',
      error: error.message
    });
  }
};


// Leave group
const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is a member
    if (!group.isMember(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    // Prevent group creator from leaving
    if (group.createdBy.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Group creator cannot leave the group. Delete the group instead.'
      });
    }

    // Remove user from group
    group.members = group.members.filter(
      member => member.userId.toString() !== userId
    );

    await group.save();

    res.json({
      success: true,
      message: `Successfully left group "${group.name}"`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error leaving group',
      error: error.message
    });
  }
};
module.exports = {
  createGroup,
  addMember,
  joinGroup,      // Add this
  leaveGroup,     // Add this
  getGroupInfo,   // Add this

  removeMember,
  getGroupMembers,
  getUserGroups,
  deleteGroup
};
