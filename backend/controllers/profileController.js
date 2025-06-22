const UserProfile = require('../models/profile');
const User = require('../models/user');
const Transaction = require('../models/transaction');

// Get complete user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user basic info
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get detailed profile
    let profile = await UserProfile.findOne({ userId })
      .populate('groupInfo.activeGroups.groupId', 'name description groupType members')
      .populate('groupInfo.favoriteGroups', 'name description');

    // Create profile if doesn't exist
    if (!profile) {
      profile = new UserProfile({
        userId: userId,
        personalInfo: {
          profilePicture: user.profilePicture || ''
        }
      });
      await profile.save();
    }

    // Get recent transactions (last 5)
    const recentTransactions = await Transaction.find({
      $or: [{ fromUser: userId }, { toUser: userId }]
    })
    .populate('fromUser', 'name email')
    .populate('toUser', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          createdAt: user.createdAt
        },
        profile: profile,
        recentTransactions: recentTransactions
      }
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// Update profile information
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    // Update basic user info if provided
    if (updateData.name || updateData.phoneNumber) {
      await User.findByIdAndUpdate(userId, {
        name: updateData.name,
        phoneNumber: updateData.phoneNumber
      });
    }

    // Update detailed profile
    let profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      profile = new UserProfile({ userId });
    }

    // Update profile sections
    if (updateData.personalInfo) {
      profile.personalInfo = { ...profile.personalInfo, ...updateData.personalInfo };
    }
    
    if (updateData.address) {
      profile.address = { ...profile.address, ...updateData.address };
    }
    
    if (updateData.languagePreferences) {
      profile.languagePreferences = { ...profile.languagePreferences, ...updateData.languagePreferences };
    }
    
    if (updateData.healthInfo) {
      profile.healthInfo = { ...profile.healthInfo, ...updateData.healthInfo };
    }
    
    if (updateData.appPreferences) {
      profile.appPreferences = { ...profile.appPreferences, ...updateData.appPreferences };
    }

    if (updateData.wallet && updateData.wallet.bankAccount) {
      profile.wallet.bankAccount = { ...profile.wallet.bankAccount, ...updateData.wallet.bankAccount };
    }

    if (updateData.wallet && updateData.wallet.upiId) {
      profile.wallet.upiId = updateData.wallet.upiId;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Get wallet information
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

    // Get recent transactions
    const recentTransactions = await Transaction.find({
      $or: [{ fromUser: userId }, { toUser: userId }]
    })
    .populate('fromUser', 'name email')
    .populate('toUser', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

    res.status(200).json({
      success: true,
      message: 'Wallet information retrieved successfully',
      data: {
        wallet: profile.wallet,
        recentTransactions: recentTransactions
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

// Get user groups
const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const profile = await UserProfile.findOne({ userId })
      .populate('groupInfo.activeGroups.groupId', 'name description groupType members createdAt')
      .populate('groupInfo.favoriteGroups', 'name description groupType');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User groups retrieved successfully',
      data: {
        activeGroups: profile.groupInfo.activeGroups,
        favoriteGroups: profile.groupInfo.favoriteGroups,
        totalGroups: profile.groupInfo.totalGroups
      }
    });

  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user groups',
      error: error.message
    });
  }
};

// Update app preferences
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notifications, privacy, accessibility, languagePreferences } = req.body;

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (notifications) {
      profile.appPreferences.notifications = { ...profile.appPreferences.notifications, ...notifications };
    }
    
    if (privacy) {
      profile.appPreferences.privacy = { ...profile.appPreferences.privacy, ...privacy };
    }
    
    if (accessibility) {
      profile.appPreferences.accessibility = { ...profile.appPreferences.accessibility, ...accessibility };
    }
    
    if (languagePreferences) {
      profile.languagePreferences = { ...profile.languagePreferences, ...languagePreferences };
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        appPreferences: profile.appPreferences,
        languagePreferences: profile.languagePreferences
      }
    });

  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getWallet,
  getUserGroups,
  updatePreferences
};
