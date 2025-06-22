// const express = require('express');
// const router = express.Router();
// const {
//   createGroup,
//   addMember,
//   removeMember,
//   getGroupMembers,
//   getUserGroups,
//   deleteGroup
// } = require('../controllers/groupController');
// const auth = require('../middlewares/auth');

// // All routes require authentication
// router.use(auth);

// // Group management routes
// router.post('/', createGroup);                           // Create group
// router.get('/my-groups', getUserGroups);                 // Get user's groups
// router.get('/:groupId/members', getGroupMembers);        // Get group members
// router.post('/:groupId/members', addMember);             // Add member to group
// router.delete('/:groupId/members/:userId', removeMember); // Remove member from group
// router.delete('/:groupId', deleteGroup);                 // Delete group

// module.exports = router;


const express = require('express');
const router = express.Router();
const {
  createGroup,
  joinGroup,
  leaveGroup,
  getGroupInfo,
  addMember,
  removeMember,
  getGroupMembers,
  getUserGroups,
  deleteGroup
} = require('../controllers/groupController');
const auth = require('../middlewares/auth');

// Public route (no auth needed to view group info)
router.get('/info/:groupId', getGroupInfo);

// Protected routes (require authentication)
router.use(auth);

router.post('/', createGroup);                    // Create group
router.post('/join', joinGroup);                  // Join group by ID
router.delete('/:groupId/leave', leaveGroup);     // Leave group
router.get('/my-groups', getUserGroups);          // Get user's groups
router.get('/:groupId/members', getGroupMembers); // Get group members
router.post('/:groupId/members', addMember);      // Add member to group (admin only)
router.delete('/:groupId/members/:userId', removeMember); // Remove member from group
router.delete('/:groupId', deleteGroup);          // Delete group

module.exports = router;
