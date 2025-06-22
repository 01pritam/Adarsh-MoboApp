// const express = require('express');
// const router = express.Router();

// // Import transaction controller
// const {
//   getUserTransactions,
//   sendMoney,
//   addMoney,
//   getTransactionStats,
//   getFamilyMembers,
//   addMoneyToElderlyWallet, // ✅ NEW
//   getElderlyFamilyMembers
// } = require('../controllers/transactionController');

// const auth = require('../middlewares/auth');

// // All routes require authentication
// router.use(auth);

// // ===== TRANSACTION ROUTES =====
// // Get user transactions with pagination and filters
// router.get('/', getUserTransactions);

// // Get transaction statistics
// router.get('/stats', getTransactionStats);

// // Send money to family member
// router.post('/send-money', sendMoney);

// // Add money to wallet
// router.post('/add-money', addMoney);

// // Get family members for money transfer
// router.get('/family-members', getFamilyMembers);


// // ✅ NEW ROUTES for family adding money to elderly
// router.post('/add-money-to-elderly', auth, addMoneyToElderlyWallet);
// router.get('/elderly-family-members', auth, getElderlyFamilyMembers);


// module.exports = router;


const express = require('express');
const router = express.Router();

// Import transaction controller
const {
  getUserTransactions,
  sendMoney,
  addMoney,
  getTransactionStats,
  getFamilyMembers,
  addMoneyToElderlyWallet,
  getElderlyFamilyMembers
} = require('../controllers/transactionController');

const auth = require('../middlewares/auth');

// All routes require authentication
router.use(auth);

// ===== TRANSACTION ROUTES =====
router.get('/', getUserTransactions);
router.get('/stats', getTransactionStats);
router.post('/send-money', sendMoney);
router.post('/add-money', addMoney);
router.get('/family-members', getFamilyMembers);

// ===== NEW ELDERLY ROUTES =====
router.post('/add-money-to-elderly', addMoneyToElderlyWallet);
router.get('/elderly-family-members', getElderlyFamilyMembers);
// Add this route to sync all user group data
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
