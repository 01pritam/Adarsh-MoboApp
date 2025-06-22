// // audiogen.js
// import path from "path";
// import * as dotenv from "dotenv";
// import fs from "fs/promises";
// import fetch from "node-fetch";
// import { traceable } from "langsmith/traceable";

// dotenv.config({ path: '../../../.env' });  

// const audioTool= async (content) => {
//   const apiKey = process.env.SPEECHIFY_API_KEY;
//   if (!apiKey) throw new Error("Set SPEECHIFY_API_KEY in your .env");

//   const ssml = `<speak>${content}</speak>`;
//   const res  = await fetch("https://api.sws.speechify.com/v1/audio/speech", {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${apiKey}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       input: ssml,
//       voice_id: "henry",
//       audio_format: "mp3",
//     }),
//   });

//   if (!res.ok) {
//     const err = await res.text();
//     throw new Error(`TTS API error ${res.status}: ${err}`);
//   }

//   const { audio_data } = await res.json();
//   const buf = Buffer.from(audio_data, "base64");
  
//   // Create a unique filename with timestamp
//   const timestamp = Date.now();
//   const fileName = `speech-${timestamp}.mp3`;
//   const filePath = path.join('/tmp', fileName);

  
//   // Ensure temp directory exists
//   await fs.mkdir(path.dirname(filePath), { recursive: true });
  
//   // Write the file
//   await fs.writeFile(filePath, buf);
//   console.log(`✅ Audio file written to: ${filePath}`);
  
//   return filePath;
// };

// export const textToSpechTool = traceable(audioTool, {
//   name: "audioTool",
//   run_type: "tool",
// });

// export default textToSpechTool



// audiogen.js
// import path from "path";
// import * as dotenv from "dotenv";
// import fs from "fs/promises";
// import fetch from "node-fetch";
// import { traceable } from "langsmith/traceable";

// dotenv.config({ path: '../../../.env' });

// const audioTool = async (content) => {
//   const wordCount = content.trim().split(/\s+/).length;
//   if (wordCount > 200) {
//     console.log("⚠️ Skipping TTS: Content exceeds 200 words.");
//     return null;
//   }

//   const apiKey = process.env.SPEECHIFY_API_KEY;
//   if (!apiKey) throw new Error("Set SPEECHIFY_API_KEY in your .env");

//   // Enhanced SSML for human-like tone
//   const ssml = `
// <speak>
//   <prosody rate="95%" pitch="medium">
//     ${content
//       .replace(/([.?!])\s+/g, '$1 <break time="500ms"/> ')
//       .replace(/important/gi, '<emphasis level="strong">important</emphasis>')
//     }
//   </prosody>
// </speak>`.trim();

//   const res = await fetch("https://api.sws.speechify.com/v1/audio/speech", {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${apiKey}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       input: ssml,
//       voice_id: "henry",
//       audio_format: "mp3",
//     }),
//   });

//   if (!res.ok) {
//     const err = await res.text();
//     throw new Error(`TTS API error ${res.status}: ${err}`);
//   }

//   const { audio_data } = await res.json();
//   const buf = Buffer.from(audio_data, "base64");

//   const timestamp = Date.now();
//   const fileName = `speech-${timestamp}.mp3`;
//   const filePath = path.join('/tmp', fileName);

//   await fs.mkdir(path.dirname(filePath), { recursive: true });
//   await fs.writeFile(filePath, buf);
//   console.log(`✅ Audio file written to: ${filePath}`);

//   return filePath;
// };

// export const textToSpechTool = traceable(audioTool, {
//   name: "audioTool",
//   run_type: "tool",
// });

// export default textToSpechTool;



// import path from "path";
// import * as dotenv from "dotenv";
// import fs from "fs/promises";
// import { createClient } from "@deepgram/sdk";
// import { traceable } from "langsmith/traceable";

// dotenv.config({ path: '../../../.env' });

// const audioTool = async (content) => {
//   const wordCount = content.trim().split(/\s+/).length;
//   if (wordCount > 200) {
//     console.log("⚠️ Skipping TTS: Content exceeds 200 words.");
//     return null;
//   }

//   const apiKey = process.env.DEEPGRAM_API_KEY;
//   if (!apiKey) throw new Error("Set DEEPGRAM_API_KEY in your .env");

//   // Create Deepgram client
//   const deepgram = createClient(apiKey);

//   try {
//     // Make TTS request
//     const response = await deepgram.speak.request(
//       { text: content },
//       {
//         model: "aura-2-thalia-en",
//         encoding: "mp3",
//       }
//     );

//     // Get the audio stream
//     const stream = await response.getStream();
//     if (!stream) {
//       throw new Error("Failed to get audio stream from Deepgram");
//     }

//     // Convert stream to buffer
//     const buffer = await getAudioBuffer(stream);

//     const timestamp = Date.now();
//     const fileName = `speech-${timestamp}.mp3`;
//     const filePath = path.join('/tmp', fileName);

//     await fs.mkdir(path.dirname(filePath), { recursive: true });
//     await fs.writeFile(filePath, buffer);
//     console.log(`✅ Audio file written to: ${filePath}`);

//     return filePath;
//   } catch (error) {
//     throw new Error(`Deepgram TTS error: ${error.message}`);
//   }
// };

// // Helper function to convert stream to buffer
// const getAudioBuffer = async (response) => {
//   const reader = response.getReader();
//   const chunks = [];
  
//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) break;
//     chunks.push(value);
//   }
  
//   const dataArray = chunks.reduce(
//     (acc, chunk) => Uint8Array.from([...acc, ...chunk]),
//     new Uint8Array(0)
//   );
  
//   return Buffer.from(dataArray.buffer);
// };

// export const textToSpechTool = traceable(audioTool, {
//   name: "audioTool",
//   run_type: "tool",
// });

// export default textToSpechTool;



// import path from "path";
// import * as dotenv from "dotenv";
// import fs from "fs/promises";
// import { traceable } from "langsmith/traceable";

// dotenv.config({ path: '../../../.env' });

// const audioTool = async (content) => {
//   const wordCount = content.trim().split(/\s+/).length;
//   if (wordCount > 200) {
//     console.log("⚠️ Skipping TTS: Content exceeds 200 words.");
//     return null;
//   }

//   const apiKey = process.env.SARVAM_API_KEY;
//   if (!apiKey) throw new Error("Set SARVAM_API_KEY in your .env");

//   try {
//     // Make TTS request to Sarvam AI
//     const response = await fetch('https://api.sarvam.ai/text-to-speech', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'api-subscription-key': apiKey
//       },
//       body: JSON.stringify({
//         inputs: [content],
//         target_language_code: "en-IN",
//         speaker: "meera",
//         speech_sample_rate: 16000,
//         enable_preprocessing: true,
//         model: "bulbul:v1"
//       })
//     });

//     if (!response.ok) {
//       throw new Error(`Sarvam API error: ${response.status} ${response.statusText}`);
//     }

//     // Get audio buffer
//     const audioBuffer = await response.arrayBuffer();
//     const buffer = Buffer.from(audioBuffer);

//     const timestamp = Date.now();
//     const fileName = `speech-${timestamp}.mp3`;
//     const filePath = path.join('/tmp', fileName);

//     await fs.mkdir(path.dirname(filePath), { recursive: true });
//     await fs.writeFile(filePath, buffer);
//     console.log(`✅ Audio file written to: ${filePath}`);

//     return filePath;
//   } catch (error) {
//     throw new Error(`Sarvam TTS error: ${error.message}`);
//   }
// };

// export const textToSpeechTool = traceable(audioTool, {
//   name: "audioTool",
//   run_type: "tool",
// });

// export default textToSpeechTool;



// import path from "path";
// import * as dotenv from "dotenv";
// import fs from "fs/promises";
// import { traceable } from "langsmith/traceable";

// dotenv.config({ path: '../../../.env' });

// const audioTool = async (content) => {
//   const wordCount = content.trim().split(/\s+/).length;
//   if (wordCount > 200) {
//     console.log("⚠️ Skipping TTS: Content exceeds 200 words.");
//     return null;
//   }

//   const apiKey = process.env.SARVAM_API_KEY;
//   if (!apiKey) throw new Error("Set SARVAM_API_KEY in your .env");

//   try {
//     // Make TTS request to Sarvam AI
//     const response = await fetch('https://api.sarvam.ai/text-to-speech', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'api-subscription-key': apiKey
//       },
//       body: JSON.stringify({
//         inputs: [content],
//         target_language_code: "en-IN",
//         speaker: "meera",
//         speech_sample_rate: 16000,
//         enable_preprocessing: true,
//         model: "bulbul:v1"
//       })
//     });

//     if (!response.ok) {
//       throw new Error(`Sarvam API error: ${response.status} ${response.statusText}`);
//     }

//     // Get audio buffer
//     const audioBuffer = await response.arrayBuffer();
//     const buffer = Buffer.from(audioBuffer);

//     const timestamp = Date.now();
//     const fileName = `speech-${timestamp}.mp3`;
//     const filePath = path.join('/tmp', fileName);

//     await fs.mkdir(path.dirname(filePath), { recursive: true });
//     await fs.writeFile(filePath, buffer);
//     console.log(`✅ Audio file written to: ${filePath}`);

//     return filePath;
//   } catch (error) {
//     throw new Error(`Sarvam TTS error: ${error.message}`);
//   }
// };

// export const textToSpeechTool = traceable(audioTool, {
//   name: "audioTool",
//   run_type: "tool",
// });

// export default textToSpeechTool;



// import path from "path";
// import * as dotenv from "dotenv";
// import fs from "fs/promises";
// import { traceable } from "langsmith/traceable";

// dotenv.config({ path: '../../../.env' });

// const audioTool = async (content) => {
//   console.log('[audioTool] Called with content:', content.slice(0, 60), '...'); // Show first 60 chars

//   const wordCount = content.trim().split(/\s+/).length;
//   console.log('[audioTool] Word count:', wordCount);

//   if (wordCount > 200) {
//     console.log("⚠️ [audioTool] Skipping TTS: Content exceeds 200 words.");
//     return null;
//   }

//   const apiKey = process.env.SARVAM_API_KEY;
//   if (!apiKey) {
//     console.error('[audioTool] SARVAM_API_KEY is not set in environment variables');
//     throw new Error("Set SARVAM_API_KEY in your .env");
//   }

//   try {
//     console.log('[audioTool] Making TTS request to Sarvam AI...');
//     const response = await fetch('https://api.sarvam.ai/text-to-speech', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'api-subscription-key': apiKey
//       },
//       body: JSON.stringify({
//         inputs: [content],
//         target_language_code: "en-IN",
//         speaker: "meera",
//         speech_sample_rate: 16000,
//         enable_preprocessing: true,
//         model: "bulbul:v1"
//       })
//     });

//     if (!response.ok) {
//       console.error(`[audioTool] Sarvam API error: ${response.status} ${response.statusText}`);
//       throw new Error(`Sarvam API error: ${response.status} ${response.statusText}`);
//     }

//     console.log('[audioTool] Sarvam API response received, reading audio buffer...');
//     const audioBuffer = await response.arrayBuffer();
//     console.log('[audioTool] Audio buffer byteLength:', audioBuffer.byteLength);

//     const buffer = Buffer.from(audioBuffer);

//     const timestamp = Date.now();
//     const fileName = `speech-${timestamp}.mp3`;
//     const filePath = path.join('/tmp', fileName);

//     console.log(`[audioTool] Ensuring directory exists: ${path.dirname(filePath)}`);
//     await fs.mkdir(path.dirname(filePath), { recursive: true });

//     console.log(`[audioTool] Writing audio file to: ${filePath}`);
//     await fs.writeFile(filePath, buffer);

//     console.log(`✅ [audioTool] Audio file written to: ${filePath}`);
//     return filePath;
//   } catch (error) {
//     console.error('[audioTool] Sarvam TTS error:', error.message);
//     throw new Error(`Sarvam TTS error: ${error.message}`);
//   }
// };

// export const textToSpeechTool = traceable(audioTool, {
//   name: "audioTool",
//   run_type: "tool",
// });

// export default textToSpeechTool;


// import path from "path";
// import * as dotenv from "dotenv";
// import fs from "fs/promises";
// import { traceable } from "langsmith/traceable";

// dotenv.config({ path: '../../../.env' }); // Adjust if your env file is elsewhere

// const audioTool = async (content) => {
//   console.log('\n[Sarvam TTS] 🔈 Called with content:\n', content.slice(0, 60), '...\n');

//   const wordCount = content.trim().split(/\s+/).length;
//   console.log('[Sarvam TTS] 🧮 Word count:', wordCount);

//   if (wordCount > 200) {
//     console.warn("⚠️ [Sarvam TTS] Skipping: content exceeds 200 words.");
//     return null;
//   }

//   const apiKey = process.env.SARVAM_API_KEY;
//   if (!apiKey) {
//     console.error('[Sarvam TTS] ❌ Missing SARVAM_API_KEY in .env');
//     throw new Error("Set SARVAM_API_KEY in your .env file");
//   }

//   try {
//     const payload = {
//       inputs: [content],
//       target_language_code: "en-IN", // fallback from "en-IN"
//       speaker: "meera",
//       speech_sample_rate: 16000,
//       enable_preprocessing: true,
//       model: "bulbul:v1"
//     };

//     console.log('[Sarvam TTS] 📦 Sending payload to API:\n', JSON.stringify(payload, null, 2));

//     const response = await fetch('https://api.sarvam.ai/text-to-speech', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'api-subscription-key': apiKey
//       },
//       body: JSON.stringify(payload)
//     });

//     console.log('[Sarvam TTS] 🔄 Response status:', response.status, response.statusText);

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('[Sarvam TTS] ❌ API Error:', response.status, response.statusText);
//       console.error('[Sarvam TTS] 📝 Response body:', errorText);
//       throw new Error(`Sarvam API Error: ${response.status} ${response.statusText}`);
//     }

//     console.log('[Sarvam TTS] ✅ API response OK. Reading audio buffer...');
//     const audioBuffer = await response.arrayBuffer();
//     console.log('[Sarvam TTS] 📏 Audio buffer size:', audioBuffer.byteLength);

//     const buffer = Buffer.from(audioBuffer);
//     const timestamp = Date.now();
//     const fileName = `speech-${timestamp}.mp3`;
//     const outputDir = path.join('./output');
//     const filePath = path.join(outputDir, fileName);

//     console.log('[Sarvam TTS] 📁 Ensuring output directory exists...');
//     await fs.mkdir(outputDir, { recursive: true });

//     console.log('[Sarvam TTS] 💾 Writing file to:', filePath);
//     await fs.writeFile(filePath, buffer);

//     console.log(`✅ [Sarvam TTS] Audio file written: ${filePath}`);
//     return filePath;

//   } catch (error) {
//     console.error('[Sarvam TTS] ❌ Error:', error.message);
//     throw new Error(`Sarvam TTS Error: ${error.message}`);
//   }
// };

// // Exporting for use in Langsmith or toolchains
// export const textToSpeechTool = traceable(audioTool, {
//   name: "audioTool",
//   run_type: "tool",
// });

// export default textToSpeechTool;


// import path from "path";
// import * as dotenv from "dotenv";
// import fs from "fs/promises";
// import fetch from "node-fetch";
// import { traceable } from "langsmith/traceable";

// dotenv.config({ path: '../../../.env' });

// const audioTool = async (content) => {
//   console.log('\n[Sarvam TTS] 🔈 Called with content:\n', content.slice(0, 60), '...\n');

//   const wordCount = content.trim().split(/\s+/).length;
//   console.log('[Sarvam TTS] 🧮 Word count:', wordCount);

//   if (wordCount > 200) {
//     console.warn("⚠️ [Sarvam TTS] Skipping: content exceeds 200 words.");
//     return null;
//   }

//   const apiKey = process.env.SARVAM_API_KEY;
//   if (!apiKey) {
//     console.error('[Sarvam TTS] ❌ Missing SARVAM_API_KEY in .env');
//     throw new Error("Set SARVAM_API_KEY in your .env file");
//   }

//   try {
//     const payload = {
//       text: content,
//       target_language_code: "en-IN",
//       speaker: "anushka", // Valid for bulbul:v2
//       model: "bulbul:v2",
//       speech_sample_rate: 22050,
//       pitch: 0.0,
//       pace: 1.0,
//       loudness: 1.0,
//       enable_preprocessing: true
//     };

//     console.log('[Sarvam TTS] 📦 Sending payload to API:\n', JSON.stringify(payload, null, 2));

//     const response = await fetch('https://api.sarvam.ai/text-to-speech', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'api-subscription-key': apiKey
//       },
//       body: JSON.stringify(payload)
//     });

//     console.log('[Sarvam TTS] 🔄 Response status:', response.status, response.statusText);

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('[Sarvam TTS] ❌ API Error:', response.status, response.statusText);
//       console.error('[Sarvam TTS] 📝 Response body:', errorText);
//       throw new Error(`Sarvam API Error: ${response.status} ${response.statusText}`);
//     }

//     const { audios } = await response.json();
//     const base64Audio = audios?.[0];

//     if (!base64Audio) {
//       console.error('[Sarvam TTS] ❌ No audio received in API response');
//       return null;
//     }

//     const buffer = Buffer.from(base64Audio, 'base64');
//     const timestamp = Date.now();
//     const fileName = `speech-${timestamp}.wav`;
//     const outputDir = path.join('./output');
//     const filePath = path.join(outputDir, fileName);

//     console.log('[Sarvam TTS] 📁 Ensuring output directory exists...');
//     await fs.mkdir(outputDir, { recursive: true });

//     console.log('[Sarvam TTS] 💾 Writing file to:', filePath);
//     await fs.writeFile(filePath, buffer);

//     console.log(`✅ [Sarvam TTS] Audio file written: ${filePath}`);
//     return filePath;

//   } catch (error) {
//     console.error('[Sarvam TTS] ❌ Error:', error.message);
//     throw new Error(`Sarvam TTS Error: ${error.message}`);
//   }
// };

// // Exporting for use in Langsmith or toolchains
// export const textToSpeechTool = traceable(audioTool, {
//   name: "audioTool",
//   run_type: "tool",
// });

// export default textToSpeechTool;




// import path from "path";
// import * as dotenv from "dotenv";
// import fs from "fs/promises";
// import fetch from "node-fetch";
// import { traceable } from "langsmith/traceable";

// dotenv.config({ path: '../../../.env' });

// const audioTool = async (content) => {
//   console.log('\n[Sarvam TTS] 🔈 Called with content:\n', content.slice(0, 60), '...\n');

//   const wordCount = content.trim().split(/\s+/).length;
//   console.log('[Sarvam TTS] 🧮 Word count:', wordCount);

//   if (wordCount > 200) {
//     console.warn("⚠️ [Sarvam TTS] Skipping: content exceeds 200 words.");
//     return null;
//   }

//   const apiKey = process.env.SARVAM_API_KEY;
//   if (!apiKey) {
//     console.error('[Sarvam TTS] ❌ Missing SARVAM_API_KEY in .env');
//     throw new Error("Set SARVAM_API_KEY in your .env file");
//   }

//   try {
//     const payload = {
//       text: content,
//       target_language_code: "en-IN",
//       speaker: "anushka", // Valid for bulbul:v2
//       model: "bulbul:v2",
//       speech_sample_rate: 22050,
//       pitch: 0.0,
//       pace: 1.0,
//       loudness: 1.0,
//       enable_preprocessing: true
//     };

//     console.log('[Sarvam TTS] 📦 Sending payload to API:\n', JSON.stringify(payload, null, 2));

//     const response = await fetch('https://api.sarvam.ai/text-to-speech', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'api-subscription-key': apiKey
//       },
//       body: JSON.stringify(payload)
//     });

//     console.log('[Sarvam TTS] 🔄 Response status:', response.status, response.statusText);

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('[Sarvam TTS] ❌ API Error:', response.status, response.statusText);
//       console.error('[Sarvam TTS] 📝 Response body:', errorText);
//       throw new Error(`Sarvam API Error: ${response.status} ${response.statusText}`);
//     }

//     const { audios } = await response.json();
//     const base64Audio = audios?.[0];

//     if (!base64Audio) {
//       console.error('[Sarvam TTS] ❌ No audio received in API response');
//       return null;
//     }

//     const buffer = Buffer.from(base64Audio, 'base64');
//     const timestamp = Date.now();
//     const fileName = `speech-${timestamp}.wav`;
//     const outputDir = path.join('./output');
//     const filePath = path.join(outputDir, fileName);

//     console.log('[Sarvam TTS] 📁 Ensuring output directory exists...');
//     await fs.mkdir(outputDir, { recursive: true });

//     console.log('[Sarvam TTS] 💾 Writing file to:', filePath);
//     await fs.writeFile(filePath, buffer);

//     console.log(`✅ [Sarvam TTS] Audio file written: ${filePath}`);
//     return filePath;

//   } catch (error) {
//     console.error('[Sarvam TTS] ❌ Error:', error.message);
//     throw new Error(`Sarvam TTS Error: ${error.message}`);
//   }
// };

// // Exporting for use in Langsmith or toolchains
// export const textToSpeechTool = traceable(audioTool, {
//   name: "audioTool",
//   run_type: "tool",
// });

// export default textToSpeechTool;



const fetch = require('node-fetch');
require('dotenv').config();

const textToSpeech = async (content) => {
  console.log('[Sarvam TTS] 🔈 Processing:', content.slice(0, 60), '...');

  const wordCount = content.trim().split(/\s+/).length;
  console.log('[Sarvam TTS] 🧮 Word count:', wordCount);

  if (wordCount > 200) {
    console.warn("⚠️ [Sarvam TTS] Skipping: content exceeds 200 words.");
    return null;
  }

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    console.error('[Sarvam TTS] ❌ Missing SARVAM_API_KEY in .env');
    throw new Error("Set SARVAM_API_KEY in your .env file");
  }

  try {
    const payload = {
      inputs: [content],  // ✅ Array format as per API docs
      target_language_code: "en-IN",
      speaker: "meera",   // ✅ Using available speaker
      model: "bulbul:v1", // ✅ Using v1 for stability
      speech_sample_rate: 22050,
      pitch: 0.0,
      pace: 1.0,
      loudness: 1.0,
      enable_preprocessing: true
    };

    console.log('[Sarvam TTS] 📦 Sending payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    console.log('[Sarvam TTS] 🔄 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Sarvam TTS] ❌ API Error:', response.status, response.statusText);
      console.error('[Sarvam TTS] 📝 Response body:', errorText);
      throw new Error(`Sarvam API Error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('[Sarvam TTS] 📥 Response keys:', Object.keys(responseData));
    
    const base64Audio = responseData.audios?.[0] || responseData.audio || responseData.data;

    if (!base64Audio) {
      console.error('[Sarvam TTS] ❌ No audio received');
      console.error('[Sarvam TTS] 📝 Full response:', JSON.stringify(responseData, null, 2));
      return null;
    }

    const buffer = Buffer.from(base64Audio, 'base64');
    console.log(`✅ [Sarvam TTS] Audio buffer created, size: ${buffer.length} bytes`);
    
    return buffer;

  } catch (error) {
    console.error('[Sarvam TTS] ❌ Error:', error.message);
    throw new Error(`Sarvam TTS Error: ${error.message}`);
  }
};

module.exports = { textToSpeech };
