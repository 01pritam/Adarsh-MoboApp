const Task = require('../models/task');
const Group = require('../models/group');
const User = require('../models/user');

// Get all tasks (with filters)
const getAllTasks = async (req, res) => {
  try {
    const { userId, groupId, status, taskType } = req.query;
    const requesterId = req.user.userId;
    
    const filter = {};
    
    // If groupId is provided, check if user is member of that group
    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group || !group.isMember(requesterId)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view tasks from this group'
        });
      }
      filter.groupId = groupId;
    } else {
      // If no groupId, show tasks from user's groups only
      const userGroups = await Group.findByUser(requesterId);
      const groupIds = userGroups.map(group => group._id);
      filter.groupId = { $in: groupIds };
    }
    
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (taskType) filter.taskType = taskType;

    const tasks = await Task.find(filter)
      .populate('userId', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('groupId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        tasks,
        totalCount: tasks.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

// Get specific task details
const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const requesterId = req.user.userId;

    const task = await Task.findById(taskId)
      .populate('userId', 'name email role phoneNumber')
      .populate('assignedTo', 'name email role')
      .populate('groupId', 'name members')
      .populate('agentId');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is authorized to view this task
    const group = await Group.findById(task.groupId._id);
    if (!group || !group.isMember(requesterId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this task'
      });
    }

    res.status(200).json({
      success: true,
      data: { task }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task details',
      error: error.message
    });
  }
};

// Get task status by task ID
// const getTaskStatus = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const requesterId = req.user.userId;

//     const task = await Task.findById(taskId).populate('groupId');
//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: 'Task not found'
//       });
//     }

//     // Check authorization
//     const group = await Group.findById(task.groupId._id);
//     if (!group || !group.isMember(requesterId)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to view this task'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: { 
//         taskId: task._id,
//         status: task.status,
//         priority: task.priority,
//         lastUpdated: task.updatedAt,
//         completedAt: task.completedAt
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching task status',
//       error: error.message
//     });
//   }
// };

// // Update task status (mark as done, in progress, etc.)
// const updateTaskStatus = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const { status, assignedTo } = req.body;
//     const requesterId = req.user.userId;

//     // Validate status
//     const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status. Valid options: pending, in_progress, completed, cancelled'
//       });
//     }

//     const task = await Task.findById(taskId).populate('groupId');
//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: 'Task not found'
//       });
//     }

//     // Check if user is authorized (group member)
//     const group = await Group.findById(task.groupId._id);
//     if (!group || !group.isMember(requesterId)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to update this task'
//       });
//     }

//     // Update task status
//     task.status = status;
    
//     // If assigning to someone, validate they're a group member
//     if (assignedTo) {
//       if (!group.isMember(assignedTo)) {
//         return res.status(400).json({
//           success: false,
//           message: 'Cannot assign task to non-group member'
//         });
//       }
//       task.assignedTo = assignedTo;
//     }

//     // Set completion time if completed
//     if (status === 'completed') {
//       task.completedAt = new Date();
//     } else {
//       task.completedAt = null;
//     }

//     await task.save();

//     // Populate updated task for response
//     await task.populate('userId', 'name email');
//     await task.populate('assignedTo', 'name email');

//     res.status(200).json({
//       success: true,
//       message: `Task status updated to ${status}`,
//       data: { task }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error updating task status',
//       error: error.message
//     });
//   }
// };

// // Assign task to family member
// const assignTask = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const { assignedTo } = req.body;
//     const requesterId = req.user.userId;

//     const task = await Task.findById(taskId).populate('groupId');
//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: 'Task not found'
//       });
//     }

//     // Check authorization
//     const group = await Group.findById(task.groupId._id);
//     if (!group || !group.isMember(requesterId)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to assign this task'
//       });
//     }

//     // Validate assignee is group member
//     if (!group.isMember(assignedTo)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Cannot assign task to non-group member'
//       });
//     }

//     task.assignedTo = assignedTo;
//     if (task.status === 'pending') {
//       task.status = 'in_progress';
//     }
    
//     await task.save();
//     await task.populate('assignedTo', 'name email');

//     res.status(200).json({
//       success: true,
//       message: 'Task assigned successfully',
//       data: { task }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error assigning task',
//       error: error.message
//     });
//   }
// };

// ✅ FIXED: Assign Task Controller
const assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const assigneeId = req.user.userId; // ✅ Extract from JWT, not from body

    console.log('🔍 === ASSIGN TASK DEBUG ===');
    console.log('📋 Task ID:', taskId);
    console.log('👤 Assignee ID (from JWT):', assigneeId);
    console.log('👤 User role:', req.user.role);

    // Find the task
    const task = await Task.findById(taskId)
      .populate('userId', 'name email role')
      .populate('groupId');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    console.log('📋 Task found:', {
      title: task.title,
      status: task.status,
      createdBy: task.userId.name,
      currentAssignee: task.assignedTo
    });

    // Check if task is already assigned
    if (task.assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Task is already assigned to someone else'
      });
    }

    // Check if task is still pending
    if (task.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Task is no longer available for assignment'
      });
    }

    // ✅ SECURITY: Check if user is a member of the group
    const group = await Group.findById(task.groupId._id);
    if (!group || !group.isMember(assigneeId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this family group'
      });
    }

    // ✅ BUSINESS LOGIC: Prevent elderly from assigning their own tasks
    if (task.userId._id.toString() === assigneeId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot assign your own help request to yourself'
      });
    }

    // ✅ ASSIGN TASK: Update task with assignee and change status
    task.assignedTo = assigneeId;
    task.status = 'in_progress';
    task.updatedAt = new Date();
    
    await task.save();

    // Get assignee details for response
    const assignee = await User.findById(assigneeId, 'name email');

    console.log('✅ Task assigned successfully to:', assignee.name);

    res.json({
      success: true,
      message: `Task assigned to ${assignee.name} successfully`,
      data: {
        taskId: task._id,
        title: task.title,
        status: task.status,
        assignedTo: {
          id: assignee._id,
          name: assignee.name,
          email: assignee.email
        },
        updatedAt: task.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Assign task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning task',
      error: error.message
    });
  }
};

// ✅ FIXED: Update Task Status Controller
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const requesterId = req.user.userId; // ✅ Extract from JWT

    console.log('🔍 === UPDATE TASK STATUS DEBUG ===');
    console.log('📋 Task ID:', taskId);
    console.log('👤 Requester ID:', requesterId);
    console.log('📊 New status:', status);

    // Validate status
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Find the task
    const task = await Task.findById(taskId)
      .populate('userId', 'name email role')
      .populate('assignedTo', 'name email')
      .populate('groupId');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // ✅ AUTHORIZATION: Check if user can update this task
    const group = await Group.findById(task.groupId._id);
    if (!group || !group.isMember(requesterId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this task'
      });
    }

    // ✅ BUSINESS LOGIC: Only assigned person or task creator can mark as completed
    if (status === 'completed') {
      const isAssignee = task.assignedTo && task.assignedTo._id.toString() === requesterId;
      const isCreator = task.userId._id.toString() === requesterId;
      
      if (!isAssignee && !isCreator) {
        return res.status(403).json({
          success: false,
          message: 'Only the assigned person or task creator can mark this as completed'
        });
      }
    }

    // Update task status
    const oldStatus = task.status;
    task.status = status;
    task.updatedAt = new Date();
    
    // Set completion time if marking as completed
    if (status === 'completed' && oldStatus !== 'completed') {
      task.completedAt = new Date();
    }

    await task.save();

    console.log('✅ Task status updated:', {
      from: oldStatus,
      to: status,
      completedAt: task.completedAt
    });

    res.json({
      success: true,
      message: `Task status updated to ${status}`,
      data: {
        taskId: task._id,
        title: task.title,
        status: task.status,
        previousStatus: oldStatus,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt,
        assignedTo: task.assignedTo
      }
    });

  } catch (error) {
    console.error('❌ Update task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task status',
      error: error.message
    });
  }
};

// ✅ FIXED: Get Task Status Controller
const getTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const requesterId = req.user.userId; // ✅ Extract from JWT

    console.log('🔍 === GET TASK STATUS DEBUG ===');
    console.log('📋 Task ID:', taskId);
    console.log('👤 Requester ID:', requesterId);

    const task = await Task.findById(taskId)
      .populate('userId', 'name email role')
      .populate('assignedTo', 'name email')
      .populate('groupId', 'name');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // ✅ AUTHORIZATION: Check if user is a group member
    const group = await Group.findById(task.groupId._id);
    if (!group || !group.isMember(requesterId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this task'
      });
    }

    res.status(200).json({
      success: true,
      data: { 
        taskId: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        createdBy: {
          id: task.userId._id,
          name: task.userId.name,
          role: task.userId.role
        },
        assignedTo: task.assignedTo ? {
          id: task.assignedTo._id,
          name: task.assignedTo.name
        } : null,
        groupName: task.groupId.name,
        createdAt: task.createdAt,
        lastUpdated: task.updatedAt,
        completedAt: task.completedAt
      }
    });
  } catch (error) {
    console.error('❌ Get task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task status',
      error: error.message
    });
  }
};




// Get tasks by status for a group
const getTasksByStatus = async (req, res) => {
  try {
    const { groupId, status } = req.params;
    const requesterId = req.user.userId;

    // Check if user is member of the group
    const group = await Group.findById(groupId);
    if (!group || !group.isMember(requesterId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view tasks from this group'
      });
    }

    const tasks = await Task.find({ groupId, status })
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        tasks,
        groupId,
        status,
        count: tasks.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks by status',
      error: error.message
    });
  }
};

// Get my assigned tasks
const getMyTasks = async (req, res) => {
  try {
    const requesterId = req.user.userId;
    const { status } = req.query;

    const filter = {
      $or: [
        { userId: requesterId },
        { assignedTo: requesterId }
      ]
    };

    if (status) {
      filter.status = status;
    }

    const tasks = await Task.find(filter)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .populate('groupId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        tasks,
        totalCount: tasks.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your tasks',
      error: error.message
    });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  getTaskStatus,
  updateTaskStatus,
  assignTask,
  getTasksByStatus,
  getMyTasks
};
