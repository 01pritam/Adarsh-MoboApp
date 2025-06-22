const express = require('express');
const router = express.Router();
const {
  createReminder,
  getReminders,
  updateReminderStatus,
  deleteReminder,
  getDueReminders,
  markNotificationSent
} = require('../controllers/reminderController');
const auth = require('../middlewares/auth');

// Apply authentication middleware to all routes
router.use(auth);

// Create a new reminder
router.post('/', createReminder);

// Get reminders (with optional filters)
// Query params: elderlyUserId, status, type
router.get('/', getReminders);

// Get due reminders (for notification system)
router.get('/due', getDueReminders);

// Update reminder status (complete, snooze, dismiss, cancel)
router.put('/:reminderId/status', updateReminderStatus);

// Mark notification as sent (for notification system)
router.put('/:reminderId/notification-sent', markNotificationSent);

// Delete a reminder
router.delete('/:reminderId', deleteReminder);

module.exports = router;
