// const express = require('express');
// const fs = require('fs');
// const multer = require('multer');
// require('dotenv').config();
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const Mood = require('../models/mood'); // 👈 import Mood model
// const mongoose = require('mongoose');

// const router = express.Router();
// const upload = multer({ dest: 'uploads/' });

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// // Helper to parse Gemini analysis into structured data
// function parseGeminiMood(analysis) {
//   const lower = analysis.toLowerCase();
//   const moodList = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'tense'];
//   const toneList = ['calm', 'tense', 'enthusiastic', 'frustrated'];
//   const speechList = ['fast', 'slow', 'clear', 'mumbled', 'stressed'];

//   const findFirstMatch = (keywords) =>
//     keywords.find(k => lower.includes(k)) || 'unknown';

//   return {
//     mood: findFirstMatch(moodList),
//     tone: findFirstMatch(toneList),
//     speechCharacteristics: findFirstMatch(speechList),
//     notes: analysis
//   };
// }

// // POST /analyze-audio
// router.post('/analyze-audio', upload.single('audio'), async (req, res) => {
//   try {
//     const userId = req.body.userId; // make sure this is passed in request
//     if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ error: 'Invalid or missing userId' });
//     }

//     if (!req.file) {
//       return res.status(400).json({ error: 'No audio file provided' });
//     }

//     const audioPath = req.file.path;
//     const buffer = fs.readFileSync(audioPath);
//     const base64Audio = buffer.toString('base64');

//     if (buffer.length / (1024 * 1024) > 20) {
//       throw new Error('Audio file too large for Gemini inline API');
//     }

//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     const prompt = `This is a voice recording. Analyze it for the speaker's emotional tone, mood, and behavior. Return:
// 1. Overall mood (happy, sad, angry, etc.)
// 2. Emotional tone (calm, tense, enthusiastic)
// 3. Speech characteristics (pace, tone, clarity)
// 4. Notable patterns or expressions
// 5. Any recommendations or insights.`;

//     const result = await model.generateContent([
//       {
//         inlineData: {
//           mimeType: "audio/mp3",
//           data: base64Audio
//         }
//       },
//       { text: prompt }
//     ]);

//     const response = await result.response;
//     const analysis = response.text();

//     fs.unlinkSync(audioPath);

//     const moodData = parseGeminiMood(analysis);

//     // Save mood to DB
//     const moodEntry = await Mood.create({
//       userId,
//       ...moodData
//     });

//     res.json({
//       success: true,
//       analysis: moodData,
//       timestamp: new Date().toISOString(),
//       moodEntry
//     });

//   } catch (error) {
//     console.error('Audio analysis error:', error);
//     if (req.file && fs.existsSync(req.file.path)) {
//       fs.unlinkSync(req.file.path);
//     }
//     res.status(500).json({ error: 'Audio analysis failed', details: error.message });
//   }
// });


// // GET /moodetails?userId=USER_ID
// router.get('/moodetails', async (req, res) => {
//   try {
//     const { userId } = req.query;
//     if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ error: 'Invalid or missing userId' });
//     }

//     const latestMood = await Mood.findOne({ userId }).sort({ timestamp: -1 });

//     if (!latestMood) {
//       return res.status(404).json({ message: 'No mood record found for this user' });
//     }

//     res.json({
//       success: true,
//       mood: latestMood
//     });

//   } catch (error) {
//     console.error('Error fetching mood:', error);
//     res.status(500).json({ error: 'Failed to fetch mood', details: error.message });
//   }
// });



const express = require('express');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Mood = require('../models/mood'); // 👈 import Mood model
const mongoose = require('mongoose');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Helper to parse Gemini analysis into structured data
function parseGeminiMood(analysis) {
  const lower = analysis.toLowerCase();
  const moodList = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'tense'];
  const toneList = ['calm', 'tense', 'enthusiastic', 'frustrated'];
  const speechList = ['fast', 'slow', 'clear', 'mumbled', 'stressed'];

  const findFirstMatch = (keywords) =>
    keywords.find(k => lower.includes(k)) || 'unknown';

  return {
    mood: findFirstMatch(moodList),
    tone: findFirstMatch(toneList),
    speechCharacteristics: findFirstMatch(speechList),
    notes: analysis
  };
}

// POST /analyze-audio
router.post('/analyze-audio', upload.single('audio'), async (req, res) => {
  try {
    const userId = req.body.userId; // make sure this is passed in request
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid or missing userId' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioPath = req.file.path;
    const buffer = fs.readFileSync(audioPath);
    const base64Audio = buffer.toString('base64');

    if (buffer.length / (1024 * 1024) > 20) {
      throw new Error('Audio file too large for Gemini inline API');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `This is a voice recording. Analyze it for the speaker's emotional tone, mood, and behavior. Return:
1. Overall mood (happy, sad, angry, etc.)
2. Emotional tone (calm, tense, enthusiastic)
3. Speech characteristics (pace, tone, clarity)
4. Notable patterns or expressions
5. Any recommendations or insights.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "audio/mp3",
          data: base64Audio
        }
      },
      { text: prompt }
    ]);

    const response = await result.response;
    const analysis = response.text();

    fs.unlinkSync(audioPath);

    const moodData = parseGeminiMood(analysis);

    // Save mood to DB
    const moodEntry = await Mood.create({
      userId,
      ...moodData
    });

    res.json({
      success: true,
      analysis: moodData,
      timestamp: new Date().toISOString(),
      moodEntry
    });

  } catch (error) {
    console.error('Audio analysis error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Audio analysis failed', details: error.message });
  }
});

// GET /moodetails?userId=USER_ID
router.get('/moodetails', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid or missing userId' });
    }

    const latestMood = await Mood.findOne({ userId }).sort({ timestamp: -1 });

    if (!latestMood) {
      return res.status(404).json({ message: 'No mood record found for this user' });
    }

    res.json({
      success: true,
      mood: latestMood
    });

  } catch (error) {
    console.error('Error fetching mood:', error);
    res.status(500).json({ error: 'Failed to fetch mood', details: error.message });
  }
});

// ✅ CRITICAL: Add this export at the end!
module.exports = router;


