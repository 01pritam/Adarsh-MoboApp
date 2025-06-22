const express = require('express');
const router = express.Router();
// const User = require('../models/user');
const axios = require('axios');

// Hardcoded push token list for now (can replace with dynamic group later)
const trustedPushTokens = [
  'ExponentPushToken[8ROVvqN01l50SXXAWdq5Ty]' // Replace with actual token(s)
];

// @route   POST /api/sos
// @desc    Trigger SOS alert without showing name
// @access  Public or Protected
router.post('/', async (req, res) => {
  let { message } = req.body;

  // Use default message if none provided or empty string
  if (!message || message.trim() === '') {
    message = '🚨 SOS Alert! Immediate attention needed.';
  }

  const payload = {
    to: trustedPushTokens,
    sound: 'default',
    title: '🚨 Emergency SOS Alert',
    body: message,
    data: {
      type: 'sos',
      timestamp: new Date()
    }
  };

  try {
    const response = await axios.post(
      'https://exp.host/--/api/v2/push/send',
      payload,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('✅ SOS alert sent:', response.data);
    res.status(200).json({ message: 'SOS alert sent' });

  } 
  catch (error) {
  console.error('❌ Failed to send SOS alert:', error?.response?.data || error.message || error);
    res.status(500).json({ error: 'Failed to send SOS alert' });
  }
});

module.exports = router;