const UserProfile = require('../models/profile');
const Transaction = require('../models/transaction');
const User = require('../models/user');

// Get wallet information with recent transactions
const getWallet = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Get recent transactions (last 10)
    const recentTransactions = await Transaction.find({
      $or: [{ fromUser: userId }, { toUser: userId }]
    })
    .populate('fromUser', 'name email')
    .populate('toUser', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

    // Get wallet statistics
    const walletStats = await getWalletStatistics(userId);

    res.status(200).json({
      success: true,
      message: 'Wallet information retrieved successfully',
      data: {
        wallet: {
          balance: profile.wallet.balance,
          currency: profile.wallet.currency,
          bankAccount: profile.wallet.bankAccount,
          upiId: profile.wallet.upiId,
          lastTransactionAt: profile.wallet.lastTransactionAt
        },
        recentTransactions: recentTransactions,
        statistics: walletStats
      }
    });

  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet information',
      error: error.message
    });
  }
};

// Update wallet settings (bank account, UPI ID)
const updateWalletSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bankAccount, upiId } = req.body;

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update bank account if provided
    if (bankAccount) {
      profile.wallet.bankAccount = {
        ...profile.wallet.bankAccount,
        ...bankAccount
      };
    }

    // Update UPI ID if provided
    if (upiId) {
      profile.wallet.upiId = upiId;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Wallet settings updated successfully',
      data: {
        wallet: {
          bankAccount: profile.wallet.bankAccount,
          upiId: profile.wallet.upiId
        }
      }
    });

  } catch (error) {
    console.error('Error updating wallet settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating wallet settings',
      error: error.message
    });
  }
};

// Get wallet balance
const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Wallet balance retrieved successfully',
      data: {
        balance: profile.wallet.balance,
        currency: profile.wallet.currency,
        lastTransactionAt: profile.wallet.lastTransactionAt
      }
    });

  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet balance',
      error: error.message
    });
  }
};

// Verify bank account
const verifyBankAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { verificationCode, accountNumber } = req.body;

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check if bank account exists
    if (!profile.wallet.bankAccount.accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'No bank account found to verify'
      });
    }

    // Verify account number matches
    if (profile.wallet.bankAccount.accountNumber !== accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Account number mismatch'
      });
    }

    // In real implementation, you would verify the code with bank API
    // For now, we'll simulate verification
    if (verificationCode === '123456') { // Mock verification
      profile.wallet.bankAccount.isVerified = true;
      profile.verification.bankAccountVerified = true;
      await profile.save();

      res.status(200).json({
        success: true,
        message: 'Bank account verified successfully',
        data: {
          bankAccount: profile.wallet.bankAccount
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

  } catch (error) {
    console.error('Error verifying bank account:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying bank account',
      error: error.message
    });
  }
};

// Get wallet transaction history
const getWalletTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, type, startDate, endDate } = req.query;

    // Build query
    const query = {
      $or: [{ fromUser: userId }, { toUser: userId }]
    };

    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalTransactions = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Wallet transactions retrieved successfully',
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalTransactions / parseInt(limit)),
          totalTransactions,
          hasNext: parseInt(page) * parseInt(limit) < totalTransactions
        }
      }
    });

  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet transactions',
      error: error.message
    });
  }
};

// Helper function to get wallet statistics
const getWalletStatistics = async (userId) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await Transaction.aggregate([
      {
        $match: {
          $or: [{ fromUser: userId }, { toUser: userId }],
          createdAt: { $gte: thirtyDaysAgo },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalSent: {
            $sum: {
              $cond: [
                { $eq: ['$fromUser', userId] },
                '$amount',
                0
              ]
            }
          },
          totalReceived: {
            $sum: {
              $cond: [
                { $eq: ['$toUser', userId] },
                '$amount',
                0
              ]
            }
          },
          avgTransactionAmount: { $avg: '$amount' }
        }
      }
    ]);

    return stats[0] || {
      totalTransactions: 0,
      totalSent: 0,
      totalReceived: 0,
      avgTransactionAmount: 0
    };

  } catch (error) {
    console.error('Error calculating wallet statistics:', error);
    return {
      totalTransactions: 0,
      totalSent: 0,
      totalReceived: 0,
      avgTransactionAmount: 0
    };
  }
};

module.exports = {
  getWallet,
  updateWalletSettings,
  getWalletBalance,
  verifyBankAccount,
  getWalletTransactions
};
