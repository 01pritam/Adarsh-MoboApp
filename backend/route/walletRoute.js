const express = require('express');
const router = express.Router();

// Import wallet controller
const {
  getWallet,
  updateWalletSettings,
  getWalletBalance,
  verifyBankAccount,
  getWalletTransactions
} = require('../controllers/walletController');

const auth = require('../middlewares/auth');

// All routes require authentication
router.use(auth);

// ===== WALLET ROUTES =====
// Get complete wallet information
router.get('/', getWallet);

// Get wallet balance only
router.get('/balance', getWalletBalance);

// Get wallet transaction history
router.get('/transactions', getWalletTransactions);

// Update wallet settings (bank account, UPI)
router.put('/settings', updateWalletSettings);

// Verify bank account
router.post('/verify-bank', verifyBankAccount);

module.exports = router;
