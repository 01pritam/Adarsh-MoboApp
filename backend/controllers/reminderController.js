// const Reminder = require('../models/reminder');
// const User = require('../models/user');
// const Group = require('../models/group');

// // Create a new reminder
// const createReminder = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       reminderType,
//       elderlyUserId,
//       groupId,
//       scheduledDateTime,
//       isRecurring,
//       recurrencePattern,
//       alarmSettings,
//       priority,
//       requiresConfirmation
//     } = req.body;

//     const createdBy = req.user.userId;

//     console.log('📝 === CREATE REMINDER DEBUG ===');
//     console.log('👤 Created by:', createdBy);
//     console.log('👴 Elderly user:', elderlyUserId);
//     console.log('📅 Scheduled for:', scheduledDateTime);

//     // Validate required fields
//     if (!title || !reminderType || !elderlyUserId || !groupId || !scheduledDateTime) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: title, reminderType, elderlyUserId, groupId, scheduledDateTime'
//       });
//     }

//     // Verify the elderly user exists and has elderly role
//     const elderlyUser = await User.findById(elderlyUserId);
//     if (!elderlyUser) {
//       return res.status(404).json({
//         success: false,
//         message: 'Elderly user not found'
//       });
//     }

//     if (elderlyUser.role !== 'elderly') {
//       return res.status(400).json({
//         success: false,
//         message: 'Reminder can only be set for users with elderly role'
//       });
//     }

//     // Verify group exists and user is a member
//     const group = await Group.findById(groupId);
//     if (!group) {
//       return res.status(404).json({
//         success: false,
//         message: 'Group not found'
//       });
//     }

//     if (!group.isMember(createdBy)) {
//       return res.status(403).json({
//         success: false,
//         message: 'You must be a member of the group to create reminders'
//       });
//     }

//     // Verify elderly user is also a member of the group
//     if (!group.isMember(elderlyUserId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Elderly user must be a member of the group'
//       });
//     }

//     // Validate scheduled date is in the future
//     const scheduledDate = new Date(scheduledDateTime);
//     if (scheduledDate <= new Date()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Scheduled date must be in the future'
//       });
//     }

//     // Create reminder
//     const reminder = new Reminder({
//       title,
//       description,
//       reminderType,
//       elderlyUserId,
//       createdBy,
//       groupId,
//       scheduledDateTime: scheduledDate,
//       isRecurring: isRecurring || false,
//       recurrencePattern: isRecurring ? recurrencePattern : undefined,
//       alarmSettings: alarmSettings || {},
//       priority: priority || 'medium',
//       requiresConfirmation: requiresConfirmation !== false
//     });

//     // Calculate next trigger
//     reminder.calculateNextTrigger();

//     await reminder.save();

//     // Populate for response
//     await reminder.populate([
//       { path: 'elderlyUserId', select: 'name email' },
//       { path: 'createdBy', select: 'name email' },
//       { path: 'groupId', select: 'name' }
//     ]);

//     console.log('✅ Reminder created successfully:', reminder._id);

//     res.status(201).json({
//       success: true,
//       message: 'Reminder created successfully',
//       data: {
//         reminder: {
//           id: reminder._id,
//           title: reminder.title,
//           description: reminder.description,
//           reminderType: reminder.reminderType,
//           elderlyUser: {
//             id: reminder.elderlyUserId._id,
//             name: reminder.elderlyUserId.name
//           },
//           createdBy: {
//             id: reminder.createdBy._id,
//             name: reminder.createdBy.name
//           },
//           group: {
//             id: reminder.groupId._id,
//             name: reminder.groupId.name
//           },
//           scheduledDateTime: reminder.scheduledDateTime,
//           nextTrigger: reminder.nextTrigger,
//           isRecurring: reminder.isRecurring,
//           priority: reminder.priority,
//           status: reminder.status,
//           createdAt: reminder.createdAt
//         }
//       }
//     });

//   } catch (error) {
//     console.error('❌ Create reminder error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error creating reminder',
//       error: error.message
//     });
//   }
// };

// // Get reminders for a user (elderly or family member)
// const getReminders = async (req, res) => {
//   try {
//     const requesterId = req.user.userId;
//     const { elderlyUserId, status, type } = req.query;

//     console.log('📋 === GET REMINDERS DEBUG ===');
//     console.log('👤 Requester:', requesterId);
//     console.log('👴 Elderly user filter:', elderlyUserId);
//     console.log('📊 Status filter:', status);

//     let query = { isActive: true };

//     // If elderlyUserId is specified, get reminders for that user
//     if (elderlyUserId) {
//       // Verify the requester can access this elderly user's reminders
//       const group = await Group.findOne({
//         $and: [
//           { 'members.userId': requesterId },
//           { 'members.userId': elderlyUserId }
//         ]
//       });

//       if (!group && requesterId !== elderlyUserId) {
//         return res.status(403).json({
//           success: false,
//           message: 'You can only view reminders for elderly users in your group'
//         });
//       }

//       query.elderlyUserId = elderlyUserId;
//     } else {
//       // Get reminders where user is either the elderly user or creator
//       query.$or = [
//         { elderlyUserId: requesterId },
//         { createdBy: requesterId }
//       ];
//     }

//     // Apply filters
//     if (status) {
//       query.status = status;
//     }

//     if (type) {
//       query.reminderType = type;
//     }

//     const reminders = await Reminder.find(query)
//       .populate('elderlyUserId', 'name email')
//       .populate('createdBy', 'name email')
//       .populate('groupId', 'name')
//       .sort({ nextTrigger: 1, scheduledDateTime: 1 });

//     console.log('✅ Found reminders:', reminders.length);

//     const mappedReminders = reminders.map(reminder => ({
//       id: reminder._id,
//       title: reminder.title,
//       description: reminder.description,
//       reminderType: reminder.reminderType,
//       elderlyUser: {
//         id: reminder.elderlyUserId._id,
//         name: reminder.elderlyUserId.name
//       },
//       createdBy: {
//         id: reminder.createdBy._id,
//         name: reminder.createdBy.name
//       },
//       group: {
//         id: reminder.groupId._id,
//         name: reminder.groupId.name
//       },
//       scheduledDateTime: reminder.scheduledDateTime,
//       nextTrigger: reminder.nextTrigger,
//       isRecurring: reminder.isRecurring,
//       priority: reminder.priority,
//       status: reminder.status,
//       alarmSettings: reminder.alarmSettings,
//       requiresConfirmation: reminder.requiresConfirmation,
//       createdAt: reminder.createdAt,
//       lastTriggered: reminder.lastTriggered
//     }));

//     res.json({
//       success: true,
//       data: {
//         reminders: mappedReminders,
//         count: mappedReminders.length
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get reminders error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching reminders',
//       error: error.message
//     });
//   }
// };

// // Update reminder status (complete, snooze, dismiss)
// const updateReminderStatus = async (req, res) => {
//   try {
//     const { reminderId } = req.params;
//     const { status, snoozeMinutes } = req.body;
//     const userId = req.user.userId;

//     console.log('🔄 === UPDATE REMINDER STATUS DEBUG ===');
//     console.log('📋 Reminder ID:', reminderId);
//     console.log('📊 New status:', status);
//     console.log('👤 User:', userId);

//     const validStatuses = ['completed', 'snoozed', 'dismissed', 'cancelled'];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
//       });
//     }

//     const reminder = await Reminder.findById(reminderId);
//     if (!reminder) {
//       return res.status(404).json({
//         success: false,
//         message: 'Reminder not found'
//       });
//     }

//     // Check if user can update this reminder
//     if (!reminder.canManage(userId)) {
//       return res.status(403).json({
//         success: false,
//         message: 'You can only update your own reminders or reminders assigned to you'
//       });
//     }

//     // Update status
//     reminder.status = status;
//     reminder.lastTriggered = new Date();

//     if (status === 'completed') {
//       reminder.completedAt = new Date();
//       reminder.completedBy = userId;
      
//       // If recurring, calculate next occurrence
//       if (reminder.isRecurring) {
//         reminder.status = 'active';
//         reminder.calculateNextTrigger();
//       }
//     } else if (status === 'snoozed') {
//       const snoozeTime = snoozeMinutes || reminder.alarmSettings.snoozeDuration || 5;
//       reminder.nextTrigger = new Date(Date.now() + (snoozeTime * 60 * 1000));
//       reminder.status = 'active'; // Reset to active after snooze
//     }

//     await reminder.save();

//     console.log('✅ Reminder status updated successfully');

//     res.json({
//       success: true,
//       message: `Reminder ${status} successfully`,
//       data: {
//         reminder: {
//           id: reminder._id,
//           status: reminder.status,
//           nextTrigger: reminder.nextTrigger,
//           completedAt: reminder.completedAt,
//           lastTriggered: reminder.lastTriggered
//         }
//       }
//     });

//   } catch (error) {
//     console.error('❌ Update reminder status error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating reminder status',
//       error: error.message
//     });
//   }
// };

// // Delete a reminder
// const deleteReminder = async (req, res) => {
//   try {
//     const { reminderId } = req.params;
//     const userId = req.user.userId;

//     console.log('🗑️ === DELETE REMINDER DEBUG ===');
//     console.log('📋 Reminder ID:', reminderId);
//     console.log('👤 User:', userId);

//     const reminder = await Reminder.findById(reminderId);
//     if (!reminder) {
//       return res.status(404).json({
//         success: false,
//         message: 'Reminder not found'
//       });
//     }

//     // Check if user can delete this reminder (only creator can delete)
//     if (reminder.createdBy.toString() !== userId) {
//       return res.status(403).json({
//         success: false,
//         message: 'Only the creator can delete a reminder'
//       });
//     }

//     // Soft delete by setting isActive to false
//     reminder.isActive = false;
//     reminder.status = 'cancelled';
//     await reminder.save();

//     console.log('✅ Reminder deleted successfully');

//     res.json({
//       success: true,
//       message: 'Reminder deleted successfully'
//     });

//   } catch (error) {
//     console.error('❌ Delete reminder error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting reminder',
//       error: error.message
//     });
//   }
// };

// // Get due reminders (for notification system)
// const getDueReminders = async (req, res) => {
//   try {
//     console.log('⏰ === GET DUE REMINDERS DEBUG ===');

//     const dueReminders = await Reminder.findDueReminders();

//     console.log('✅ Found due reminders:', dueReminders.length);

//     const mappedReminders = dueReminders.map(reminder => ({
//       id: reminder._id,
//       title: reminder.title,
//       description: reminder.description,
//       reminderType: reminder.reminderType,
//       elderlyUser: {
//         id: reminder.elderlyUserId._id,
//         name: reminder.elderlyUserId.name,
//         email: reminder.elderlyUserId.email,
//         phoneNumber: reminder.elderlyUserId.phoneNumber
//       },
//       createdBy: {
//         id: reminder.createdBy._id,
//         name: reminder.createdBy.name
//       },
//       scheduledDateTime: reminder.scheduledDateTime,
//       nextTrigger: reminder.nextTrigger,
//       priority: reminder.priority,
//       alarmSettings: reminder.alarmSettings,
//       requiresConfirmation: reminder.requiresConfirmation
//     }));

//     res.json({
//       success: true,
//       data: {
//         reminders: mappedReminders,
//         count: mappedReminders.length
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get due reminders error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching due reminders',
//       error: error.message
//     });
//   }
// };

// // Mark reminder notification as sent
// const markNotificationSent = async (req, res) => {
//   try {
//     const { reminderId } = req.params;

//     const reminder = await Reminder.findById(reminderId);
//     if (!reminder) {
//       return res.status(404).json({
//         success: false,
//         message: 'Reminder not found'
//       });
//     }

//     reminder.notificationSent = true;
//     reminder.lastTriggered = new Date();
//     await reminder.save();

//     res.json({
//       success: true,
//       message: 'Notification marked as sent'
//     });

//   } catch (error) {
//     console.error('❌ Mark notification sent error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error marking notification as sent',
//       error: error.message
//     });
//   }
// };

// module.exports = {
//   createReminder,
//   getReminders,
//   updateReminderStatus,
//   deleteReminder,
//   getDueReminders,
//   markNotificationSent
// };




const Reminder = require('../models/reminder'); // ✅ Fixed: Capital R
const User = require('../models/user');         // ✅ Fixed: Capital U  
const Group = require('../models/group');       // ✅ Fixed: Capital G

// Create a new reminder with auto-detection of elderly users
const createReminder = async (req, res) => {
  try {
    const {
      title,
      description,
      reminderType,
      elderlyUserId, // Optional - can be auto-detected
      groupId,
      scheduledDateTime,
      isRecurring,
      recurrencePattern,
      alarmSettings,
      priority,
      requiresConfirmation
    } = req.body;

    const createdBy = req.user.userId;

    console.log('📝 === CREATE REMINDER DEBUG ===');
    console.log('👤 Created by:', createdBy);
    console.log('📁 Group ID:', groupId);
    console.log('👴 Elderly user (if provided):', elderlyUserId);

    // Validate required fields
    if (!title || !reminderType || !groupId || !scheduledDateTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, reminderType, groupId, scheduledDateTime'
      });
    }

    // Verify group exists and user is a member
    const group = await Group.findById(groupId)
      .populate('members.userId', 'name email role');
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (!group.isMember(createdBy)) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of the group to create reminders'
      });
    }

    // ✅ NEW: Auto-detect elderly users in the group
    const elderlyMembers = group.members.filter(
      member => member.userId.role === 'elderly'
    );

    console.log('👥 Found elderly members in group:', elderlyMembers.length);
    elderlyMembers.forEach(member => {
      console.log(`  - ${member.userId.name} (${member.userId._id})`);
    });

    if (elderlyMembers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No elderly users found in this group'
      });
    }

    let targetElderlyUserId;

    // If elderlyUserId is provided, validate it
    if (elderlyUserId) {
      const isValidElderlyUser = elderlyMembers.some(
        member => member.userId._id.toString() === elderlyUserId
      );
      
      if (!isValidElderlyUser) {
        return res.status(400).json({
          success: false,
          message: 'Specified elderly user is not a member of this group or does not have elderly role'
        });
      }
      
      targetElderlyUserId = elderlyUserId;
    } else {
      // ✅ AUTO-SELECT: If only one elderly user, auto-select them
      if (elderlyMembers.length === 1) {
        targetElderlyUserId = elderlyMembers[0].userId._id;
        console.log('✅ Auto-selected elderly user:', elderlyMembers[0].userId.name);
      } else {
        // Multiple elderly users - return them for frontend selection
        return res.status(400).json({
          success: false,
          message: 'Multiple elderly users found in group. Please specify elderlyUserId.',
          data: {
            elderlyUsers: elderlyMembers.map(member => ({
              id: member.userId._id,
              name: member.userId.name,
              email: member.userId.email
            }))
          }
        });
      }
    }

    // Validate scheduled date is in the future
    const scheduledDate = new Date(scheduledDateTime);
    if (scheduledDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled date must be in the future'
      });
    }

    // Create reminder with auto-detected elderly user
    const reminder = new Reminder({
      title,
      description,
      reminderType,
      elderlyUserId: targetElderlyUserId, // ✅ Auto-detected or validated
      createdBy,
      groupId,
      scheduledDateTime: scheduledDate,
      isRecurring: isRecurring || false,
      recurrencePattern: isRecurring ? recurrencePattern : undefined,
      alarmSettings: alarmSettings || {},
      priority: priority || 'medium',
      requiresConfirmation: requiresConfirmation !== false
    });

    // Calculate next trigger
    reminder.calculateNextTrigger();
    await reminder.save();

    // Populate for response
    await reminder.populate([
      { path: 'elderlyUserId', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
      { path: 'groupId', select: 'name' }
    ]);

    console.log('✅ Reminder created successfully:', reminder._id);

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      data: {
        reminder: {
          id: reminder._id,
          title: reminder.title,
          description: reminder.description,
          reminderType: reminder.reminderType,
          elderlyUser: {
            id: reminder.elderlyUserId._id,
            name: reminder.elderlyUserId.name
          },
          createdBy: {
            id: reminder.createdBy._id,
            name: reminder.createdBy.name
          },
          group: {
            id: reminder.groupId._id,
            name: reminder.groupId.name
          },
          scheduledDateTime: reminder.scheduledDateTime,
          nextTrigger: reminder.nextTrigger,
          isRecurring: reminder.isRecurring,
          priority: reminder.priority,
          status: reminder.status,
          createdAt: reminder.createdAt
        }
      }
    });

  } catch (error) {
    console.error('❌ Create reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating reminder',
      error: error.message
    });
  }
};

// Get reminders for a user (elderly or family member)
const getReminders = async (req, res) => {
  try {
    const requesterId = req.user.userId;
    const { elderlyUserId, status, type } = req.query;

    console.log('📋 === GET REMINDERS DEBUG ===');
    console.log('👤 Requester:', requesterId);
    console.log('👴 Elderly user filter:', elderlyUserId);
    console.log('📊 Status filter:', status);

    let query = { isActive: true };

    // If elderlyUserId is specified, get reminders for that user
    if (elderlyUserId) {
      // Verify the requester can access this elderly user's reminders
      const group = await Group.findOne({
        $and: [
          { 'members.userId': requesterId },
          { 'members.userId': elderlyUserId }
        ]
      });

      if (!group && requesterId !== elderlyUserId) {
        return res.status(403).json({
          success: false,
          message: 'You can only view reminders for elderly users in your group'
        });
      }

      query.elderlyUserId = elderlyUserId;
    } else {
      // Get reminders where user is either the elderly user or creator
      query.$or = [
        { elderlyUserId: requesterId },
        { createdBy: requesterId }
      ];
    }

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (type) {
      query.reminderType = type;
    }

    const reminders = await Reminder.find(query)
      .populate('elderlyUserId', 'name email')
      .populate('createdBy', 'name email')
      .populate('groupId', 'name')
      .sort({ nextTrigger: 1, scheduledDateTime: 1 });

    console.log('✅ Found reminders:', reminders.length);

    const mappedReminders = reminders.map(reminder => ({
      id: reminder._id,
      title: reminder.title,
      description: reminder.description,
      reminderType: reminder.reminderType,
      elderlyUser: {
        id: reminder.elderlyUserId._id,
        name: reminder.elderlyUserId.name
      },
      createdBy: {
        id: reminder.createdBy._id,
        name: reminder.createdBy.name
      },
      group: {
        id: reminder.groupId._id,
        name: reminder.groupId.name
      },
      scheduledDateTime: reminder.scheduledDateTime,
      nextTrigger: reminder.nextTrigger,
      isRecurring: reminder.isRecurring,
      priority: reminder.priority,
      status: reminder.status,
      alarmSettings: reminder.alarmSettings,
      requiresConfirmation: reminder.requiresConfirmation,
      createdAt: reminder.createdAt,
      lastTriggered: reminder.lastTriggered
    }));

    res.json({
      success: true,
      data: {
        reminders: mappedReminders,
        count: mappedReminders.length
      }
    });

  } catch (error) {
    console.error('❌ Get reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reminders',
      error: error.message
    });
  }
};

// Update reminder status (complete, snooze, dismiss)
const updateReminderStatus = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const { status, snoozeMinutes } = req.body;
    const userId = req.user.userId;

    console.log('🔄 === UPDATE REMINDER STATUS DEBUG ===');
    console.log('📋 Reminder ID:', reminderId);
    console.log('📊 New status:', status);
    console.log('👤 User:', userId);

    const validStatuses = ['completed', 'snoozed', 'dismissed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const reminder = await Reminder.findById(reminderId);
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Check if user can update this reminder
    if (!reminder.canManage(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reminders or reminders assigned to you'
      });
    }

    // Update status
    reminder.status = status;
    reminder.lastTriggered = new Date();

    if (status === 'completed') {
      reminder.completedAt = new Date();
      reminder.completedBy = userId;
      
      // If recurring, calculate next occurrence
      if (reminder.isRecurring) {
        reminder.status = 'active';
        reminder.calculateNextTrigger();
      }
    } else if (status === 'snoozed') {
      const snoozeTime = snoozeMinutes || reminder.alarmSettings.snoozeDuration || 5;
      reminder.nextTrigger = new Date(Date.now() + (snoozeTime * 60 * 1000));
      reminder.status = 'active'; // Reset to active after snooze
    }

    await reminder.save();

    console.log('✅ Reminder status updated successfully');

    res.json({
      success: true,
      message: `Reminder ${status} successfully`,
      data: {
        reminder: {
          id: reminder._id,
          status: reminder.status,
          nextTrigger: reminder.nextTrigger,
          completedAt: reminder.completedAt,
          lastTriggered: reminder.lastTriggered
        }
      }
    });

  } catch (error) {
    console.error('❌ Update reminder status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating reminder status',
      error: error.message
    });
  }
};

// Delete a reminder
const deleteReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const userId = req.user.userId;

    console.log('🗑️ === DELETE REMINDER DEBUG ===');
    console.log('📋 Reminder ID:', reminderId);
    console.log('👤 User:', userId);

    const reminder = await Reminder.findById(reminderId);
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Check if user can delete this reminder (only creator can delete)
    if (reminder.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the creator can delete a reminder'
      });
    }

    // Soft delete by setting isActive to false
    reminder.isActive = false;
    reminder.status = 'cancelled';
    await reminder.save();

    console.log('✅ Reminder deleted successfully');

    res.json({
      success: true,
      message: 'Reminder deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting reminder',
      error: error.message
    });
  }
};

// Get due reminders (for notification system)
const getDueReminders = async (req, res) => {
  try {
    console.log('⏰ === GET DUE REMINDERS DEBUG ===');

    const dueReminders = await Reminder.findDueReminders();

    console.log('✅ Found due reminders:', dueReminders.length);

    const mappedReminders = dueReminders.map(reminder => ({
      id: reminder._id,
      title: reminder.title,
      description: reminder.description,
      reminderType: reminder.reminderType,
      elderlyUser: {
        id: reminder.elderlyUserId._id,
        name: reminder.elderlyUserId.name,
        email: reminder.elderlyUserId.email,
        phoneNumber: reminder.elderlyUserId.phoneNumber
      },
      createdBy: {
        id: reminder.createdBy._id,
        name: reminder.createdBy.name
      },
      scheduledDateTime: reminder.scheduledDateTime,
      nextTrigger: reminder.nextTrigger,
      priority: reminder.priority,
      alarmSettings: reminder.alarmSettings,
      requiresConfirmation: reminder.requiresConfirmation
    }));

    res.json({
      success: true,
      data: {
        reminders: mappedReminders,
        count: mappedReminders.length
      }
    });

  } catch (error) {
    console.error('❌ Get due reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching due reminders',
      error: error.message
    });
  }
};

// Mark reminder notification as sent
const markNotificationSent = async (req, res) => {
  try {
    const { reminderId } = req.params;

    const reminder = await Reminder.findById(reminderId);
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    reminder.notificationSent = true;
    reminder.lastTriggered = new Date();
    await reminder.save();

    res.json({
      success: true,
      message: 'Notification marked as sent'
    });

  } catch (error) {
    console.error('❌ Mark notification sent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as sent',
      error: error.message
    });
  }
};

// ✅ NEW: Get elderly users in a specific group
const getElderlyUsersInGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const requesterId = req.user.userId;

    console.log('👥 === GET ELDERLY USERS IN GROUP ===');
    console.log('📁 Group ID:', groupId);
    console.log('👤 Requester:', requesterId);

    // Find the group with populated members
    const group = await Group.findById(groupId)
      .populate('members.userId', 'name email role phoneNumber');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if requester is a member
    if (!group.isMember(requesterId)) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of the group to view elderly users'
      });
    }

    // ✅ Filter elderly users
    const elderlyMembers = group.members.filter(
      member => member.userId.role === 'elderly'
    );

    console.log('✅ Found elderly users:', elderlyMembers.length);

    const elderlyUsers = elderlyMembers.map(member => ({
      id: member.userId._id,
      name: member.userId.name,
      email: member.userId.email,
      phoneNumber: member.userId.phoneNumber,
      groupRole: member.role,
      joinedAt: member.addedAt
    }));

    res.json({
      success: true,
      data: {
        groupId: group._id,
        groupName: group.name,
        elderlyUsers: elderlyUsers,
        count: elderlyUsers.length
      }
    });

  } catch (error) {
    console.error('❌ Get elderly users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching elderly users',
      error: error.message
    });
  }
};

module.exports = {
  createReminder,
  getReminders,
  updateReminderStatus,
  deleteReminder,
  getDueReminders,
  markNotificationSent,
  getElderlyUsersInGroup // ✅ Added new function
};
