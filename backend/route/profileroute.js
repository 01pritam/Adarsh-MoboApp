const express = require('express');
const router = express.Router();

// Import profile controller
const {
  getProfile,
  updateProfile,
  getUserGroups,
  updatePreferences
} = require('../controllers/profileController');
const User = require('../models/user');
const UserProfile=require('../models/profile');
const auth = require('../middlewares/auth');

// All routes require authentication
router.use(auth);

// ===== PROFILE ROUTES =====
// Get complete user profile
router.get('/', getProfile);

// Update user profile
router.put('/', updateProfile);

// Update user preferences
router.put('/preferences', updatePreferences);

// Get user groups
router.get('/groups', getUserGroups);
// Add this route to sync all user group data
// ✅ ADD THIS FUNCTION FIRST - This is what was missing
const syncUserGroupData = async (userId) => {
  try {
    console.log('🔄 Syncing group data for user:', userId);
    
    // Get user with groups
    const user = await User.findById(userId).populate('groups');
    if (!user) {
      console.log('❌ User not found');
      return false;
    }
    
    console.log('👤 User groups:', user.groups.map(g => ({ id: g._id, name: g.name })));
    
    // Get or create user profile
    let profile = await UserProfile.findOne({ userId });
    if (!profile) {
      console.log('📋 Creating new profile for user');
      profile = new UserProfile({ userId });
    }
    
    // Initialize groupInfo if it doesn't exist
    if (!profile.groupInfo) {
      profile.groupInfo = {
        activeGroups: [],
        totalGroups: 0,
        favoriteGroups: []
      };
    }
    
    // Sync activeGroups from User.groups
    profile.groupInfo.activeGroups = user.groups.map(group => ({
      groupId: group._id,
      role: user.role || 'member', // Use user's role or default to 'member'
      joinedAt: new Date(),
      isActive: true
    }));
    
    profile.groupInfo.totalGroups = user.groups.length;
    
    await profile.save();
    
    console.log('✅ Group data synced successfully');
    console.log('📋 Profile activeGroups:', profile.groupInfo.activeGroups.length);
    
    return true;
  } catch (error) {
    console.error('💥 Error syncing group data:', error);
    return false;
  }
};

router.post('/sync-all-group-data', auth, async (req, res) => {
  try {
    console.log('🔄 Syncing group data for all users...');
    
    const users = await User.find({}).populate('groups');
    let syncedCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      const success = await syncUserGroupData(user._id);
      if (success) {
        syncedCount++;
      } else {
        errorCount++;
      }
    }
    
    res.json({
      success: true,
      message: 'Group data sync completed',
      data: {
        totalUsers: users.length,
        syncedCount,
        errorCount
      }
    });
    
  } catch (error) {
    console.error('💥 Sync all error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
