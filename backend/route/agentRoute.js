// const express = require('express');
// const router = express.Router();
// const { processMessage } = require('../controllers/agentcontroller');
// const auth = require('../middlewares/auth');

// // POST /ai endpoint to receive transcript and return AI response
// router.post('/ai', auth, async (req, res) => {
//   try {
//     const { transcript } = req.body;
    
//     if (!transcript) {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'Transcript is required' 
//       });
//     }

//     // Process the message through AI controller
//     const result = await processMessage(req.user.userId, transcript);

//     res.json({ 
//       success: true, 
//       data: result 
//     });
    
//   } catch (error) {
//     console.error('Error in /ai endpoint:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: 'Internal server error',
//       message: error.message 
//     });
//   }
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const { 
  processMessage, 
  getAgentHistory,
  getUrgentMessages, 
  getUserMessages 
} = require('../controllers/agentController');
const auth = require('../middlewares/auth');

// POST /ai endpoint to receive transcript and return AI response
router.post('/ai', auth, async (req, res) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ 
        success: false, 
        error: 'Transcript is required' 
      });
    }

    const result = await processMessage(req.user.userId, transcript);

    res.json({ 
      success: true, 
      data: result 
    });
    
  } catch (error) {
    console.error('Error in /ai endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET agent history
router.get('/history', auth, getAgentHistory);

// GET urgent messages
router.get('/urgent', auth, getUrgentMessages);

// GET user messages
router.get('/messages', auth, getUserMessages);

module.exports = router;
