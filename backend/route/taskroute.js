const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  getTaskById,
  getTaskStatus,
  updateTaskStatus,
  assignTask,
  getTasksByStatus,
  getMyTasks
} = require('../controllers/taskContorller');
const auth = require('../middlewares/auth');

// All routes require authentication
router.use(auth);

// Task management routes
router.get('/', getAllTasks);                                    // Get all tasks (with filters)
router.get('/my-tasks', getMyTasks);                             // Get my assigned/created tasks
router.get('/:taskId', getTaskById);                             // Get specific task details
// router.get('/:taskId/status', getTaskStatus);                    // Get task status
// router.put('/:taskId/status', updateTaskStatus);                 // Update task status
// router.put('/:taskId/assign', assignTask);                       // Assign task to family member
router.get('/group/:groupId/status/:status', getTasksByStatus);  // Get tasks by status for group



router.put('/:taskId/assign', assignTask); // No body needed - gets user from JWT
router.put('/:taskId/status', updateTaskStatus); // Only needs { status } in body
router.get('/:taskId/status', getTaskStatus); // No body needed


module.exports = router;
