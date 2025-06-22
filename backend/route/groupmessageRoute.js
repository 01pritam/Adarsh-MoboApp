// const express = require('express');
// const router = express.Router();
// const groupMessageController = require('../controllers/groupmessageController');
// const authMiddleware = require('../middlewares/auth');

// // Apply authentication middleware to all message routes
// router.use(authMiddleware);

// // Message management routes
// router.post('/:groupId/messages', groupMessageController.sendMessage);
// router.get('/:groupId/messages', groupMessageController.getGroupMessages);
// router.put('/messages/:messageId', groupMessageController.editMessage);
// router.delete('/messages/:messageId', groupMessageController.deleteMessage);

// // Message interaction routes
// router.post('/messages/:messageId/read', groupMessageController.markMessageAsRead);
// router.post('/:groupId/messages/read-all', groupMessageController.markAllMessagesAsRead);
// router.get('/:groupId/messages/unread-count', groupMessageController.getUnreadCount);

// // Message reactions
// router.post('/messages/:messageId/reactions', groupMessageController.addReaction);
// router.delete('/messages/:messageId/reactions', groupMessageController.removeReaction);

// module.exports = router;


const express = require('express');
const router = express.Router();
const groupMessageController = require('../controllers/groupmessageController');
const authMiddleware = require('../middlewares/auth');

// Apply authentication middleware to all message routes
router.use(authMiddleware);

// ✅ KEEP: Message management routes (for REST API fallback)
router.post('/:groupId/messages', groupMessageController.sendMessage);
router.get('/:groupId/messages', groupMessageController.getGroupMessages);
router.put('/messages/:messageId', groupMessageController.editMessage);
router.delete('/messages/:messageId', groupMessageController.deleteMessage);

// ✅ KEEP: Message interaction routes
router.post('/messages/:messageId/read', groupMessageController.markMessageAsRead);
router.post('/:groupId/messages/read-all', groupMessageController.markAllMessagesAsRead);
router.get('/:groupId/messages/unread-count', groupMessageController.getUnreadCount);

// ✅ KEEP: Message reactions
router.post('/messages/:messageId/reactions', groupMessageController.addReaction);
router.delete('/messages/:messageId/reactions', groupMessageController.removeReaction);

module.exports = router;
