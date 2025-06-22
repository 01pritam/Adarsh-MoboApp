
const mongoose = require('mongoose');

const Message = require('../models/message');
const User = require('../models/user');
const Agent = require('../models/Agent');
const Task = require('../models/task');
const Group = require('../models/group');
const tracedChatTool = require('../utils/ai').default;
const { textToSpeech } = require('../utils/audio'); // ✅ Correct import
const { storeAudioFile } = require('../utils/supbase');
const { performance } = require('perf_hooks');
// const { matchProductInDb } = require('../utils/matchProductInDb');
const { allItems } = require('../data/dummyData');
const Order=require('../models/order');
// const processMessage = async (senderId, transcript) => {
//   const startTime = Date.now();
  
//   try {
//     // 1. Analyze urgency using LLM
//     const urgencyPrompt = `Analyze the following message from an elderly person and determine if it indicates an urgent situation requiring immediate family attention. Consider health emergencies, safety concerns, distress, or immediate needs. Reply with only 'urgent' or 'not urgent'. Message: "${transcript}"`;
    
//     const urgencyResponse = await tracedChatTool(urgencyPrompt);
//     const isUrgent = urgencyResponse.toLowerCase().includes('urgent');

//     // 2. Generate AI response to the elderly person
//     const responsePrompt = `You are a caring AI assistant helping an elderly person. Respond warmly and helpfully to their message. Keep it brief and reassuring. Message: "${transcript}"`;
    
//     const aiResponse = await tracedChatTool(responsePrompt);

//     // 3. Find sender user
//     const sender = await User.findById(senderId);
//     if (!sender) {
//       throw new Error('Sender not found');
//     }

//     // 4. Create Agent record for history
//     const agentRecord = new Agent({
//       userId: senderId,
//       transcript,
//       aiResponse,
//       metadata: {
//         urgency: isUrgent ? 'urgent' : 'not urgent',
//         audioUrl: null,
//         processingTime: Date.now() - startTime,
//         taskCreated: false
//       }
//     });

//     await agentRecord.save();

//     // 5. Check if transcript indicates a task (food ordering, etc.)
//     const taskAnalysisPrompt = `Analyze this message from an elderly person and determine if they are requesting help with a specific task. If yes, identify the task type and provide a brief title. Respond in JSON format: {"hasTask": true/false, "taskType": "food_order/medication/appointment/emergency/general", "title": "brief title", "description": "what needs to be done"}. Message: "${transcript}"`;
    
//     const taskAnalysisResponse = await tracedChatTool(taskAnalysisPrompt);
    
//     let taskCreated = false;
//     let createdTask = null;

//     try {
//       const taskAnalysis = JSON.parse(taskAnalysisResponse);
      
//       if (taskAnalysis.hasTask) {
//         // Find user's groups to create task
//         const userGroups = await Group.findByUser(senderId);
        
//         if (userGroups.length > 0) {
//           // Use the first group (or you can implement logic to select appropriate group)
//           const targetGroup = userGroups[0];
          
//           // Create task
//           createdTask = new Task({
//             userId: senderId,
//             groupId: targetGroup._id,
//             agentId: agentRecord._id,
//             title: taskAnalysis.title || 'Task from transcript',
//             description: taskAnalysis.description || transcript,
//             taskType: taskAnalysis.taskType || 'general',
//             priority: isUrgent ? 'urgent' : 'medium'
//           });

//           await createdTask.save();
          
//           // Update agent record
//           agentRecord.metadata.taskCreated = true;
//           agentRecord.metadata.taskId = createdTask._id;
//           await agentRecord.save();
          
//           taskCreated = true;

//           // Notify group members about the new task
//           await notifyGroupMembers(targetGroup._id, createdTask, sender);
//         }
//       }
//     } catch (parseError) {
//       console.log('Could not parse task analysis, continuing without task creation');
//     }

//     // 6. Create message record
//     const message = new Message({
//       transcript,
//       senderId,
//       urgencyFlag: isUrgent,
//       familyMemberRoles: [],
//       aiResponse,
//       metadata: {
//         urgency: isUrgent ? 'urgent' : 'not urgent',
//         senderName: sender.name,
//         familyMemberCount: 0,
//         processingTime: Date.now() - startTime,
//         audioGenerated: false
//       }
//     });

//     await message.save();

//     // 7. Convert AI response to speech and upload to Supabase
//     let audioUrl = null;
//     try {
//       const audioFilePath = await textToSpeechTool(aiResponse);
//       if (audioFilePath) {
//         audioUrl = await storeAudioFile(message._id.toString(), audioFilePath);
//         message.audioUrl = audioUrl;
//         message.metadata.audioGenerated = true;
//         await message.save();

//         // Update agent record with audio URL
//         agentRecord.metadata.audioUrl = audioUrl;
//         await agentRecord.save();
//       }
//     } catch (audioError) {
//       console.error('Audio generation failed:', audioError);
//     }

//     // 8. Notify family members if urgent
//     if (isUrgent) {
//       await notifyFamilyMembers(sender, message, isUrgent);
//       message.notificationsSent = true;
//       await message.save();
//     }

//     // 9. Update processing time
//     const finalProcessingTime = Date.now() - startTime;
//     message.metadata.processingTime = finalProcessingTime;
//     agentRecord.metadata.processingTime = finalProcessingTime;
    
//     await message.save();
//     await agentRecord.save();

//     return {
//       messageId: message._id,
//       agentId: agentRecord._id,
//       aiResponse,
//       audioUrl,
//       urgency: isUrgent,
//       transcript,
//       familyNotified: isUrgent,
//       taskCreated,
//       taskId: createdTask ? createdTask._id : null,
//       processingTime: finalProcessingTime
//     };

//   } catch (error) {
//     console.error('Error processing message:', error);
//     throw error;
//   }
// };

// Notify group members about new task

//very important code for agent part
// const processMessage = async (senderId, transcript) => {
//   const startTime = Date.now();

//   try {
//     // 1. Analyze urgency using LLM
//     const urgencyPrompt = `Analyze the following message from an elderly person and determine if it indicates an urgent situation requiring immediate family attention. Consider health emergencies, safety concerns, distress, or immediate needs. Reply with only 'urgent' or 'not urgent'. Message: "${transcript}"`;

//     const urgencyResponse = await tracedChatTool(urgencyPrompt);
//     const isUrgent = urgencyResponse.toLowerCase().includes('urgent');

//     // 2. Generate AI response to the elderly person
//     const responsePrompt = `You are a caring AI assistant helping an elderly person. Respond warmly and helpfully to their message. Keep it brief and reassuring. Message: "${transcript}"`;

//     const aiResponse = await tracedChatTool(responsePrompt);

//     // 3. Find sender user
//     const sender = await User.findById(senderId);
//     if (!sender) throw new Error('Sender not found');

//     // 4. Create Agent record
//     const agentRecord = new Agent({
//       userId: senderId,
//       transcript,
//       aiResponse,
//       metadata: {
//         urgency: isUrgent ? 'urgent' : 'not urgent',
//         audioUrl: null,
//         processingTime: Date.now() - startTime,
//         taskCreated: false
//       }
//     });

//     await agentRecord.save();

//     // 5. Detect task intent using LLM
//     const taskAnalysisPrompt = `Analyze this message from an elderly person and determine if they are requesting help with a specific task. If yes, identify the task type and provide a brief title. Respond in JSON format: {"hasTask": true/false, "taskType": "food_order/medication/appointment/emergency/general", "title": "brief title", "description": "what needs to be done"}. Respond with only the JSON object. Message: "${transcript}"`;

//     const taskAnalysisResponse = await tracedChatTool(taskAnalysisPrompt);
//     console.log('🧠 Raw task analysis response:', taskAnalysisResponse);

//     let taskCreated = false;
//     let createdTask = null;

//     // Safely parse JSON from LLM
//     try {
//       const jsonMatch = taskAnalysisResponse.match(/\{[\s\S]*\}/);
//       if (!jsonMatch) throw new Error("No JSON object found");

//       const taskAnalysis = JSON.parse(jsonMatch[0]);

//       if (taskAnalysis.hasTask) {
//         const userGroups = await Group.findByUser(senderId);
//         if (userGroups.length > 0) {
//           const targetGroup = userGroups[0];

//           createdTask = new Task({
//             userId: senderId,
//             groupId: targetGroup._id,
//             agentId: agentRecord._id,
//             title: taskAnalysis.title || 'Task from transcript',
//             description: taskAnalysis.description || transcript,
//             taskType: taskAnalysis.taskType || 'general',
//             priority: isUrgent ? 'urgent' : 'medium'
//           });

//           await createdTask.save();

//           agentRecord.metadata.taskCreated = true;
//           agentRecord.metadata.taskId = createdTask._id;
//           await agentRecord.save();

//           taskCreated = true;

//           await notifyGroupMembers(targetGroup._id, createdTask, sender);
//         }
//       }
//     } catch (parseError) {
//       console.error('❌ Could not parse task analysis:', parseError.message);
//       console.log('⚠️ Skipping task creation. Raw response was:', taskAnalysisResponse);
//     }

//     // 6. Save message record
//     const message = new Message({
//       transcript,
//       senderId,
//       urgencyFlag: isUrgent,
//       familyMemberRoles: [],
//       aiResponse,
//       metadata: {
//         urgency: isUrgent ? 'urgent' : 'not urgent',
//         senderName: sender.name,
//         familyMemberCount: 0,
//         processingTime: Date.now() - startTime,
//         audioGenerated: false
//       }
//     });

//     await message.save();

//     // 7. Generate and upload audio response
//     let audioUrl = null;
//     try {
//       const audioFilePath = await textToSpeechTool(aiResponse);
//       if (audioFilePath) {
//         audioUrl = await storeAudioFile(message._id.toString(), audioFilePath);
//         message.audioUrl = audioUrl;
//         message.metadata.audioGenerated = true;
//         await message.save();

//         agentRecord.metadata.audioUrl = audioUrl;
//         await agentRecord.save();
//       }
//     } catch (audioError) {
//       console.error('Audio generation failed:', audioError.message);
//     }

//     // 8. Notify family if urgent
//     if (isUrgent) {
//       await notifyFamilyMembers(sender, message, isUrgent);
//       message.notificationsSent = true;
//       await message.save();
//     }

//     // 9. Final metadata update
//     const finalProcessingTime = Date.now() - startTime;
//     message.metadata.processingTime = finalProcessingTime;
//     agentRecord.metadata.processingTime = finalProcessingTime;

//     await message.save();
//     await agentRecord.save();

//     return {
//       messageId: message._id,
//       agentId: agentRecord._id,
//       aiResponse,
//       audioUrl,
//       urgency: isUrgent,
//       transcript,
//       familyNotified: isUrgent,
//       taskCreated,
//       taskId: createdTask ? createdTask._id : null,
//       processingTime: finalProcessingTime
//     };

//   } catch (error) {
//     console.error('❌ Error processing message:', error.message);
//     throw error;
//   }
// };



//updated agent code
// const processMessage = async (senderId, transcript) => {
//   const startTime = Date.now();

//   try {
//     // 1. Urgency detection
//     const urgencyPrompt = `Analyze the following message from an elderly person and determine if it indicates an urgent situation requiring immediate family attention. Consider health emergencies, safety concerns, distress, or immediate needs. Reply with only 'urgent' or 'not urgent'. Message: "${transcript}"`;

//     const urgencyResponse = await tracedChatTool(urgencyPrompt);
//     const isUrgent = urgencyResponse.toLowerCase().includes('urgent');

//     // 2. Task detection (STRICT)
//     const taskAnalysisPrompt = `
// Analyze this message from an elderly person and determine if they are explicitly asking someone to help with a task.

// Only respond with JSON like:
// {
//   "hasTask": true or false,
//   "taskType": "food_order" | "medication" | "appointment" | "emergency" | "general",
//   "title": "brief title",
//   "description": "what needs to be done"
// }

// Only mark hasTask as true if there is a clear, actionable request like "Can you get my medicine", "Please book an appointment", or "Help me with food". Do NOT mark casual or reflective messages as tasks.

// Message: "${transcript}"
//     `;

//     const taskAnalysisResponse = await tracedChatTool(taskAnalysisPrompt);
//     console.log('🧠 Raw task analysis response:', taskAnalysisResponse);

//     let taskCreated = false;
//     let createdTask = null;
//     let hasTask = false;

//     let taskAnalysis;
//     try {
//       const jsonMatch = taskAnalysisResponse.match(/\{[\s\S]*\}/);
//       if (jsonMatch) {
//         taskAnalysis = JSON.parse(jsonMatch[0]);
//         hasTask = taskAnalysis.hasTask;
//       }
//     } catch (err) {
//       console.warn('❌ Task analysis JSON parsing failed:', err.message);
//     }

//     const sender = await User.findById(senderId);
//     if (!sender) throw new Error('Sender not found');

//     // 3. Chat-based or task-based AI response
//     let aiResponse = '';
//     if (hasTask) {
//       // Simple direct response for task
//       aiResponse = `Okay! I’ve understood your request. We’ll handle: ${taskAnalysis.title || 'your task'}.`;
//     } else {
//       // Conversation history for friendly chat
//       const previousMessages = await Message.find({ senderId })
//         .sort({ createdAt: -1 })
//         .limit(5);

//       const chatHistory = previousMessages.map(m => `User: ${m.transcript}\nAI: ${m.aiResponse}`).reverse().join('\n');

//       const conversationPrompt = `
// You are a friendly, caring AI assistant talking with an elderly person. Continue the conversation based on their current message.

// Chat history:
// ${chatHistory}

// New message: "${transcript}"

// Respond warmly, clearly, and concisely.
//       `;

//       aiResponse = await tracedChatTool(conversationPrompt);
//     }

//     // 4. Save Agent record
//     const agentRecord = new Agent({
//       userId: senderId,
//       transcript,
//       aiResponse,
//       metadata: {
//         urgency: isUrgent ? 'urgent' : 'not urgent',
//         processingTime: Date.now() - startTime,
//         taskCreated: false
//       }
//     });
//     await agentRecord.save();

//     // 5. Create task if required
//     if (hasTask) {
//       const userGroups = await Group.findByUser(senderId);
//       if (userGroups.length > 0) {
//         const targetGroup = userGroups[0];

//         createdTask = new Task({
//           userId: senderId,
//           groupId: targetGroup._id,
//           agentId: agentRecord._id,
//           title: taskAnalysis.title || 'Task from transcript',
//           description: taskAnalysis.description || transcript,
//           taskType: taskAnalysis.taskType || 'general',
//           priority: isUrgent ? 'urgent' : 'medium'
//         });

//         await createdTask.save();

//         agentRecord.metadata.taskCreated = true;
//         agentRecord.metadata.taskId = createdTask._id;
//         await agentRecord.save();

//         taskCreated = true;

//         await notifyGroupMembers(targetGroup._id, createdTask, sender);
//       }
//     }

//     // 6. Save message
//     const message = new Message({
//       transcript,
//       senderId,
//       urgencyFlag: isUrgent,
//       familyMemberRoles: [],
//       aiResponse,
//       metadata: {
//         urgency: isUrgent ? 'urgent' : 'not urgent',
//         senderName: sender.name,
//         familyMemberCount: 0,
//         processingTime: Date.now() - startTime,
//         audioGenerated: false
//       }
//     });

//     await message.save();

//     // 7. Audio generation
//     let audioUrl = null;
//     try {
//       const audioFilePath = await textToSpeechTool(aiResponse);
//       if (audioFilePath) {
//         audioUrl = await storeAudioFile(message._id.toString(), audioFilePath);
//         message.audioUrl = audioUrl;
//         message.metadata.audioGenerated = true;
//         await message.save();

//         agentRecord.metadata.audioUrl = audioUrl;
//         await agentRecord.save();
//       }
//     } catch (audioError) {
//       console.error('Audio generation failed:', audioError.message);
//     }

//     // 8. Notify family
//     if (isUrgent) {
//       await notifyFamilyMembers(sender, message, isUrgent);
//       message.notificationsSent = true;
//       await message.save();
//     }

//     // 9. Final timing updates
//     const finalProcessingTime = Date.now() - startTime;
//     message.metadata.processingTime = finalProcessingTime;
//     agentRecord.metadata.processingTime = finalProcessingTime;

//     await message.save();
//     await agentRecord.save();

//     return {
//       messageId: message._id,
//       agentId: agentRecord._id,
//       aiResponse,
//       audioUrl,
//       urgency: isUrgent,
//       transcript,
//       familyNotified: isUrgent,
//       taskCreated,
//       taskId: createdTask ? createdTask._id : null,
//       processingTime: finalProcessingTime
//     };

//   } catch (error) {
//     console.error('❌ Error processing message:', error.message);
//     throw error;
//   }
// };

// const processMessage = async (senderId, transcript) => {
//   const t0 = performance.now();

//   try {
//     const times = {};

//     // 1. Urgency detection
//     const urgencyPrompt = `Analyze the following message... Message: "${transcript}"`;
//     const t1 = performance.now();
//     const urgencyResponse = await tracedChatTool(urgencyPrompt);
//     const t2 = performance.now();
//     times.urgencyAnalysis = t2 - t1;

//     const isUrgent = urgencyResponse.toLowerCase().includes('urgent');

//     // 2. Task detection
//     const taskAnalysisPrompt = `Analyze this message... Message: "${transcript}"`;
//     const t3 = performance.now();
//     const taskAnalysisResponse = await tracedChatTool(taskAnalysisPrompt);
//     const t4 = performance.now();
//     times.taskAnalysis = t4 - t3;

//     console.log('🧠 Raw task analysis response:', taskAnalysisResponse);

//     let taskCreated = false;
//     let createdTask = null;
//     let hasTask = false;

//     let taskAnalysis;
//     try {
//       const jsonMatch = taskAnalysisResponse.match(/\{[\s\S]*\}/);
//       if (jsonMatch) {
//         taskAnalysis = JSON.parse(jsonMatch[0]);
//         hasTask = taskAnalysis.hasTask;
//       }
//     } catch (err) {
//       console.warn('❌ Task analysis JSON parsing failed:', err.message);
//     }

//     const sender = await User.findById(senderId);
//     if (!sender) throw new Error('Sender not found');

//     // 3. Chat-based or task-based AI response
//     const t5 = performance.now();
//     let aiResponse = '';
//     if (hasTask) {
//       aiResponse = `Okay! I’ve understood your request. We’ll handle: ${taskAnalysis.title || 'your task'}.`;
//     } else {
//       const previousMessages = await Message.find({ senderId }).sort({ createdAt: -1 }).limit(5);
//       const chatHistory = previousMessages.map(m => `User: ${m.transcript}\nAI: ${m.aiResponse}`).reverse().join('\n');

//       const conversationPrompt = `You are a friendly AI assistant...\n${chatHistory}\nNew message: "${transcript}"`;
//       aiResponse = await tracedChatTool(conversationPrompt);
//     }
//     const t6 = performance.now();
//     times.aiResponse = t6 - t5;

//     // 4. Save Agent
//     const t7 = performance.now();
//     const agentRecord = await new Agent({
//       userId: senderId,
//       transcript,
//       aiResponse,
//       metadata: {
//         urgency: isUrgent ? 'urgent' : 'not urgent',
//         processingTime: Date.now() - t0,
//         taskCreated: false
//       }
//     }).save();
//     const t8 = performance.now();
//     times.agentSave = t8 - t7;

//     // 5. Create task
//     const t9 = performance.now();
//     if (hasTask) {
//       const userGroups = await Group.findByUser(senderId);
//       if (userGroups.length > 0) {
//         const targetGroup = userGroups[0];

//         createdTask = await new Task({
//           userId: senderId,
//           groupId: targetGroup._id,
//           agentId: agentRecord._id,
//           title: taskAnalysis.title || 'Task from transcript',
//           description: taskAnalysis.description || transcript,
//           taskType: taskAnalysis.taskType || 'general',
//           priority: isUrgent ? 'urgent' : 'medium'
//         }).save();

//         await Agent.findByIdAndUpdate(agentRecord._id, {
//           $set: {
//             'metadata.taskCreated': true,
//             'metadata.taskId': createdTask._id
//           }
//         });

//         taskCreated = true;
//         await notifyGroupMembers(targetGroup._id, createdTask, sender);
//       }
//     }
//     const t10 = performance.now();
//     times.taskCreation = t10 - t9;

//     // 6. Save Message
//     const t11 = performance.now();
//     const message = await new Message({
//       transcript,
//       senderId,
//       urgencyFlag: isUrgent,
//       familyMemberRoles: [],
//       aiResponse,
//       metadata: {
//         urgency: isUrgent ? 'urgent' : 'not urgent',
//         senderName: sender.name,
//         familyMemberCount: 0,
//         processingTime: Date.now() - t0,
//         audioGenerated: false
//       }
//     }).save();
//     const t12 = performance.now();
//     times.messageSave = t12 - t11;

//     // 7. Audio generation
//     let audioUrl = null;
//     const t13 = performance.now();
//     try {
//       const audioFilePath = await textToSpeechTool(aiResponse);
//       if (audioFilePath) {
//         audioUrl = await storeAudioFile(message._id.toString(), audioFilePath);

//         await Message.findByIdAndUpdate(message._id, {
//           $set: {
//             audioUrl,
//             'metadata.audioGenerated': true
//           }
//         });

//         await Agent.findByIdAndUpdate(agentRecord._id, {
//           $set: {
//             'metadata.audioUrl': audioUrl
//           }
//         });
//       }
//     } catch (audioError) {
//       console.error('Audio generation failed:', audioError.message);
//     }
//     const t14 = performance.now();
//     times.audioGeneration = t14 - t13;

//     // 8. Family notification
//     const t15 = performance.now();
//     if (isUrgent) {
//       await notifyFamilyMembers(sender, message, isUrgent);
//       await Message.findByIdAndUpdate(message._id, {
//         $set: { notificationsSent: true }
//       });
//     }
//     const t16 = performance.now();
//     times.familyNotification = t16 - t15;

//     // 9. Final processing update
//     const finalProcessingTime = Date.now() - t0;
//     await Message.findByIdAndUpdate(message._id, {
//       $set: { 'metadata.processingTime': finalProcessingTime }
//     });
//     await Agent.findByIdAndUpdate(agentRecord._id, {
//       $set: { 'metadata.processingTime': finalProcessingTime }
//     });

//     console.log('📊 Performance summary (ms):', times);

//     return {
//       messageId: message._id,
//       agentId: agentRecord._id,
//       aiResponse,
//       audioUrl,
//       urgency: isUrgent,
//       transcript,
//       familyNotified: isUrgent,
//       taskCreated,
//       taskId: createdTask ? createdTask._id : null,
//       processingTime: finalProcessingTime
//     };

//   } catch (error) {
//     console.error('❌ Error processing message:', error.message);
//     throw error;
//   }
// };



//very imp for low latency

// const processMessage = async (senderId, transcript) => {
//   const startTime = Date.now();

//   try {
//     // 1. Analyze urgency using LLM
//     const urgencyPrompt = `Analyze the following message from an elderly person and determine if it indicates an urgent situation requiring immediate family attention. Consider health emergencies, safety concerns, distress, or immediate needs. Reply with only 'urgent' or 'not urgent'. Message: "${transcript}"`;

//     const urgencyResponse = await tracedChatTool(urgencyPrompt);
//     const isUrgent = urgencyResponse.toLowerCase().includes('urgent');

//     // 2. Find sender user
//     const sender = await User.findById(senderId);
//     if (!sender) throw new Error('Sender not found');

//     // 3. Simple YES/NO Task detection
//     const taskDetectionPrompt = `Does this message from an elderly person request something that requires PHYSICAL ACTION by a family member?

// Examples that need PHYSICAL ACTION (answer YES):
// - "I want to order bread" → Family needs to order
// - "I need medicine" → Family needs to get medicine
// - "Book me an appointment" → Family needs to call/book
// - "I'm hungry" → Family needs to get food
// - "Can you get groceries" → Family needs to shop

// Examples that DON'T need physical action (answer NO):
// - "How are you?" → Just conversation
// - "What time is it?" → Information only
// - "Tell me a joke" → Entertainment only

// Message: "${transcript}"

// Answer only YES or NO:`;

//     const taskDetectionResponse = await tracedChatTool(taskDetectionPrompt);
//     const hasTask = taskDetectionResponse.toLowerCase().includes('yes');
    
//     console.log('🧠 Task detection response:', taskDetectionResponse, 'hasTask:', hasTask);

//     // 4. Get task details if task detected
//     let taskAnalysis = null;
//     if (hasTask) {
//       const detailPrompt = `The message "${transcript}" requires family help. Categorize it:

// What type of help is needed?
// - food_order (ordering food, groceries, restaurants)
// - medication (medicine, pills, pharmacy)
// - appointment (doctor, dentist, services)
// - emergency (urgent health/safety)
// - general (other physical help)

// What would be a short title for this task?

// Reply in this format:
// TYPE: [category]
// TITLE: [short title]`;

//       const detailResponse = await tracedChatTool(detailPrompt);
      
//       const typeMatch = detailResponse.match(/TYPE:\s*(\w+)/i);
//       const titleMatch = detailResponse.match(/TITLE:\s*(.+)/i);
      
//       taskAnalysis = {
//         hasTask: true,
//         taskType: typeMatch ? typeMatch[1] : 'general',
//         title: titleMatch ? titleMatch[1].trim() : 'Help needed',
//         description: transcript
//       };
//     }

//     // 5. Generate appropriate AI response
//     let aiResponse = '';
//     if (hasTask && taskAnalysis) {
//       // SHORT task confirmation
//       aiResponse = `Got it! I've created a task for "${taskAnalysis.title}". Your family will take care of this for you.`;
//     } else {
//       // SHORT conversational response
//       const responsePrompt = `Reply to this elderly person in exactly 1 short, friendly sentence: "${transcript}"`;
//       aiResponse = await tracedChatTool(responsePrompt);
//     }

//     // 6. Create Agent record
//     const agentRecord = new Agent({
//       userId: senderId,
//       transcript,
//       aiResponse,
//       metadata: {
//         urgency: isUrgent ? 'urgent' : 'not urgent',
//         audioUrl: null,
//         processingTime: Date.now() - startTime,
//         taskCreated: false
//       }
//     });

//     await agentRecord.save();

//     // 7. Create task if detected
//     let taskCreated = false;
//     let createdTask = null;

//     if (hasTask && taskAnalysis) {
//       const userGroups = await Group.findByUser(senderId);
//       if (userGroups.length > 0) {
//         const targetGroup = userGroups[0];

//         createdTask = new Task({
//           userId: senderId,
//           groupId: targetGroup._id,
//           agentId: agentRecord._id,
//           title: taskAnalysis.title || 'Task from transcript',
//           description: taskAnalysis.description || transcript,
//           taskType: taskAnalysis.taskType || 'general',
//           priority: isUrgent ? 'urgent' : 'medium'
//         });

//         await createdTask.save();

//         agentRecord.metadata.taskCreated = true;
//         agentRecord.metadata.taskId = createdTask._id;
//         await agentRecord.save();

//         taskCreated = true;
//         console.log('✅ Task created successfully:', createdTask._id);

//         await notifyGroupMembers(targetGroup._id, createdTask, sender);
//       }
//     }

//     // 8. Save message record
//     const message = new Message({
//       transcript,
//       senderId,
//       urgencyFlag: isUrgent,
//       familyMemberRoles: [],
//       aiResponse,
//       metadata: {
//         urgency: isUrgent ? 'urgent' : 'not urgent',
//         senderName: sender.name,
//         familyMemberCount: 0,
//         processingTime: Date.now() - startTime,
//         audioGenerated: false
//       }
//     });

//     await message.save();

//     // 9. Generate and upload audio response
//     let audioUrl = null;
//     try {
//       const audioFilePath = await textToSpeechTool(aiResponse);
//       if (audioFilePath) {
//         audioUrl = await storeAudioFile(message._id.toString(), audioFilePath);
//         message.audioUrl = audioUrl;
//         message.metadata.audioGenerated = true;
//         await message.save();

//         agentRecord.metadata.audioUrl = audioUrl;
//         await agentRecord.save();
//       }
//     } catch (audioError) {
//       console.error('Audio generation failed:', audioError.message);
//     }

//     // 10. Notify family if urgent
//     if (isUrgent) {
//       await notifyFamilyMembers(sender, message, isUrgent);
//       message.notificationsSent = true;
//       await message.save();
//     }

//     // 11. Final metadata update
//     const finalProcessingTime = Date.now() - startTime;
//     message.metadata.processingTime = finalProcessingTime;
//     agentRecord.metadata.processingTime = finalProcessingTime;

//     await message.save();
//     await agentRecord.save();

//     return {
//       success: true,
//       data: {
//         messageId: message._id,
//         agentId: agentRecord._id,
//         aiResponse,
//         audioUrl,
//         urgency: isUrgent,
//         transcript,
//         familyNotified: isUrgent,
//         taskCreated,
//         taskId: createdTask ? createdTask._id : null,
//         processingTime: finalProcessingTime
//       }
//     };

//   } catch (error) {
//     console.error('❌ Error processing message:', error.message);
//     return {
//       success: false,
//       error: 'Message processing failed',
//       details: error.message
//     };
//   }
// };









// const processMessage = async (senderId, transcript) => {
//   const startTime = Date.now();

//   try {
//     // 1. Analyze urgency using LLM
//     const urgencyPrompt = `Analyze the following message from an elderly person and determine if it indicates an urgent situation requiring immediate family attention. Consider health emergencies, safety concerns, distress, or immediate needs. Reply with only 'urgent' or 'not urgent'. Message: "${transcript}"`;

//     const urgencyResponse = await tracedChatTool(urgencyPrompt);
//     const isUrgent = urgencyResponse.toLowerCase().includes('urgent');

//     // 2. Find sender user
//     const sender = await User.findById(senderId);
//     if (!sender) throw new Error('Sender not found');

//     // 3. Simple YES/NO Task detection
//     const taskDetectionPrompt = `Does this message from an elderly person request something that requires PHYSICAL ACTION by a family member?

// Examples that need PHYSICAL ACTION (answer YES):
// - "I want to order bread" → Family needs to order
// - "I need medicine" → Family needs to get medicine
// - "Book me an appointment" → Family needs to call/book
// - "I'm hungry" → Family needs to get food
// - "Can you get groceries" → Family needs to shop

// Examples that DON'T need physical action (answer NO):
// - "How are you?" → Just conversation
// - "What time is it?" → Information only
// - "Tell me a joke" → Entertainment only

// Message: "${transcript}"

// Answer only YES or NO:`;

//     const taskDetectionResponse = await tracedChatTool(taskDetectionPrompt);
//     const hasTask = taskDetectionResponse.toLowerCase().includes('yes');
    
//     console.log('🧠 Task detection response:', taskDetectionResponse, 'hasTask:', hasTask);

//     // 4. Get task details if task detected
//     let taskAnalysis = null;
//     if (hasTask) {
//       const detailPrompt = `The message "${transcript}" requires family help. Categorize it:

// What type of help is needed?
// - food_order (ordering food, groceries, restaurants)
// - medication (medicine, pills, pharmacy)
// - appointment (doctor, dentist, services)
// - emergency (urgent health/safety)
// - general (other physical help)

// What would be a short title for this task?

// Reply in this format:
// TYPE: [category]
// TITLE: [short title]`;

//       const detailResponse = await tracedChatTool(detailPrompt);
      
//       const typeMatch = detailResponse.match(/TYPE:\s*(\w+)/i);
//       const titleMatch = detailResponse.match(/TITLE:\s*(.+)/i);
      
//       taskAnalysis = {
//         hasTask: true,
//         taskType: typeMatch ? typeMatch[1] : 'general',
//         title: titleMatch ? titleMatch[1].trim() : 'Help needed',
//         description: transcript
//       };
//     }

//     // 5. Generate appropriate AI response
//   // 5. Generate appropriate AI response
// // 5. Generate appropriate AI response
// // 5. Generate appropriate AI response
// // 5. Generate appropriate AI response
// let aiResponse = '';
// if (hasTask && taskAnalysis) {
//   // Let LLM generate ONE respectful task confirmation response
//   const taskConfirmationPrompt = `You are a helpful AI assistant speaking to an elderly person. You have just created a task called "${taskAnalysis.title}" and their family will help them.

// Respond with exactly ONE short, warm, respectful message (1-2 sentences only). 

// IMPORTANT: Mention that you have "created a task" or "set up a task" in your response.

// Be caring but treat them with dignity. Do not use words like "dear" or sound condescending. Speak to them as you would to any adult.

// Your response:`;

//   aiResponse = await tracedChatTool(taskConfirmationPrompt);
// } else {
//   // SHORT conversational response
//   const responsePrompt = `Reply to this elderly person in exactly 1 short, friendly sentence: "${transcript}"`;
//   aiResponse = await tracedChatTool(responsePrompt);
// }

//     // 6. Create Agent record
//     const agentRecord = new Agent({
//       userId: senderId,
//       transcript,
//       aiResponse,
//       metadata: {
//         urgency: isUrgent ? 'urgent' : 'not urgent',
//         audioUrl: null,
//         processingTime: Date.now() - startTime,
//         taskCreated: false
//       }
//     });

//     await agentRecord.save();

//     // 7. Create task if detected
//     let taskCreated = false;
//     let createdTask = null;

//     if (hasTask && taskAnalysis) {
//       const userGroups = await Group.findByUser(senderId);
//       if (userGroups.length > 0) {
//         const targetGroup = userGroups[0];

//         createdTask = new Task({
//           userId: senderId,
//           groupId: targetGroup._id,
//           agentId: agentRecord._id,
//           title: taskAnalysis.title || 'Task from transcript',
//           description: taskAnalysis.description || transcript,
//           taskType: taskAnalysis.taskType || 'general',
//           priority: isUrgent ? 'urgent' : 'medium'
//         });

//         await createdTask.save();

//         agentRecord.metadata.taskCreated = true;
//         agentRecord.metadata.taskId = createdTask._id;
//         await agentRecord.save();

//         taskCreated = true;
//         console.log('✅ Task created successfully:', createdTask._id);

//         await notifyGroupMembers(targetGroup._id, createdTask, sender);
//       }
//     }

//     // 8. Save message record
//     const message = new Message({
//       transcript,
//       senderId,
//       urgencyFlag: isUrgent,
//       familyMemberRoles: [],
//       aiResponse,
//       metadata: {
//         urgency: isUrgent ? 'urgent' : 'not urgent',
//         senderName: sender.name,
//         familyMemberCount: 0,
//         processingTime: Date.now() - startTime,
//         audioGenerated: false
//       }
//     });

//     await message.save();

//     // 9. Generate and upload audio response
//     let audioUrl = null;
//     try {
//       const audioFilePath = await textToSpeechTool(aiResponse);
//       if (audioFilePath) {
//         audioUrl = await storeAudioFile(message._id.toString(), audioFilePath);
//         message.audioUrl = audioUrl;
//         message.metadata.audioGenerated = true;
//         await message.save();

//         agentRecord.metadata.audioUrl = audioUrl;
//         await agentRecord.save();
//       }
//     } catch (audioError) {
//       console.error('Audio generation failed:', audioError.message);
//     }

//     // 10. Notify family if urgent
//     if (isUrgent) {
//       await notifyFamilyMembers(sender, message, isUrgent);
//       message.notificationsSent = true;
//       await message.save();
//     }

//     // 11. Final metadata update
//     const finalProcessingTime = Date.now() - startTime;
//     message.metadata.processingTime = finalProcessingTime;
//     agentRecord.metadata.processingTime = finalProcessingTime;

//     await message.save();
//     await agentRecord.save();

//     return {
//       success: true,
//       data: {
//         messageId: message._id,
//         agentId: agentRecord._id,
//         aiResponse,
//         audioUrl,
//         urgency: isUrgent,
//         transcript,
//         familyNotified: isUrgent,
//         taskCreated,
//         taskId: createdTask ? createdTask._id : null,
//         processingTime: finalProcessingTime
//       }
//     };

//   } catch (error) {
//     console.error('❌ Error processing message:', error.message);
//     return {
//       success: false,
//       error: 'Message processing failed',
//       details: error.message
//     };
//   }
// };



///very imp

// const processMessage = async (senderId, transcript) => {
//   const startTime = Date.now();

//   try {
//     // 1. Analyze urgency using LLM
//     const urgencyPrompt = `Analyze the following message from an elderly person and determine if it indicates an urgent situation requiring immediate family attention. Consider health emergencies, safety concerns, distress, or immediate needs. Reply with only 'urgent' or 'not urgent'. Message: "${transcript}"`;

//     const urgencyResponse = await tracedChatTool(urgencyPrompt);
//     const isUrgent = urgencyResponse.toLowerCase().includes('urgent');

//     // 2. Find sender user
//     const sender = await User.findById(senderId);
//     if (!sender) throw new Error('Sender not found');

//     // 3. Simple YES/NO Task detection
//     const taskDetectionPrompt = `Does this message from an elderly person request something that requires PHYSICAL ACTION by a family member?

// Examples that need PHYSICAL ACTION (answer YES):
// - "I want to order bread" → Family needs to order
// - "I need medicine" → Family needs to get medicine
// - "Book me an appointment" → Family needs to call/book
// - "I'm hungry" → Family needs to get food
// - "Can you get groceries" → Family needs to shop

// Examples that DON'T need physical action (answer NO):
// - "How are you?" → Just conversation
// - "What time is it?" → Information only
// - "Tell me a joke" → Entertainment only

// Message: "${transcript}"

// Answer only YES or NO:`;

//     const taskDetectionResponse = await tracedChatTool(taskDetectionPrompt);
//     const hasTask = taskDetectionResponse.toLowerCase().includes('yes');
    
//     console.log('🧠 Task detection response:', taskDetectionResponse, 'hasTask:', hasTask);

//     // 4. Get task details if task detected
//     let taskAnalysis = null;
//     if (hasTask) {
//       const detailPrompt = `The message "${transcript}" requires family help. Categorize it:

// What type of help is needed?
// - food_order (ordering food, groceries, restaurants)
// - medication (medicine, pills, pharmacy)
// - appointment (doctor, dentist, services)
// - emergency (urgent health/safety)
// - general (other physical help)

// What would be a short title for this task?

// Reply in this format:
// TYPE: [category]
// TITLE: [short title]`;

//       const detailResponse = await tracedChatTool(detailPrompt);
      
//       const typeMatch = detailResponse.match(/TYPE:\s*(\w+)/i);
//       const titleMatch = detailResponse.match(/TITLE:\s*(.+)/i);
      
//       taskAnalysis = {
//         hasTask: true,
//         taskType: typeMatch ? typeMatch[1] : 'general',
//         title: titleMatch ? titleMatch[1].trim() : 'Help needed',
//         description: transcript
//       };
//     }

//     // 5. Generate appropriate AI response
//     let aiResponse = '';
//     if (hasTask && taskAnalysis) {
//       // Let LLM generate ONE respectful task confirmation response
//       const taskConfirmationPrompt = `You are a helpful AI assistant speaking to an elderly person. You have just created a task called "${taskAnalysis.title}" and their family will help them.

// Respond with exactly ONE short, warm, respectful message (1-2 sentences only). 

// IMPORTANT: Mention that you have "created a task" or "set up a task" in your response.

// Be caring but treat them with dignity. Do not use words like "dear" or sound condescending. Speak to them as you would to any adult.

// Your response:`;

//       aiResponse = await tracedChatTool(taskConfirmationPrompt);
//     } else {
//       // SHORT conversational response
//       const responsePrompt = `Reply to this elderly person in exactly 1 short, friendly sentence: "${transcript}"`;
//       aiResponse = await tracedChatTool(responsePrompt);
//     }

//     // 6. Create Agent record
//     const agentRecord = new Agent({
//       userId: senderId,
//       transcript,
//       aiResponse,
//       metadata: {
//         urgency: isUrgent ? 'urgent' : 'not urgent',
//         audioUrl: null,
//         processingTime: Date.now() - startTime,
//         taskCreated: false
//       }
//     });

//     await agentRecord.save();

//     // 7. Create task if detected
//     let taskCreated = false;
//     let createdTask = null;

//     if (hasTask && taskAnalysis) {
//       const userGroups = await Group.findByUser(senderId);
//       if (userGroups.length > 0) {
//         const targetGroup = userGroups[0];

//         createdTask = new Task({
//           userId: senderId,
//           groupId: targetGroup._id,
//           agentId: agentRecord._id,
//           title: taskAnalysis.title || 'Task from transcript',
//           description: taskAnalysis.description || transcript,
//           taskType: taskAnalysis.taskType || 'general',
//           priority: isUrgent ? 'urgent' : 'medium'
//         });

//         await createdTask.save();

//         agentRecord.metadata.taskCreated = true;
//         agentRecord.metadata.taskId = createdTask._id;
//         await agentRecord.save();

//         taskCreated = true;
//         console.log('✅ Task created successfully:', createdTask._id);

//         await notifyGroupMembers(targetGroup._id, createdTask, sender);
//       }
//     }

//     // 8. Save message record
//     const message = new Message({
//       transcript,
//       senderId,
//       urgencyFlag: isUrgent,
//       familyMemberRoles: [],
//       aiResponse,
//       metadata: {
//         urgency: isUrgent ? 'urgent' : 'not urgent',
//         senderName: sender.name,
//         familyMemberCount: 0,
//         processingTime: Date.now() - startTime,
//         audioGenerated: false
//       }
//     });

//     await message.save();

//     // 9. Generate and upload audio response - ENHANCED DEBUGGING
//     let audioUrl = null;
//     try {
//       console.log('🎵 Starting audio generation...');
//       console.log('🔑 SARVAM_API_KEY exists:', !!process.env.SARVAM_API_KEY);
//       console.log('📝 AI Response length:', aiResponse.length);
//       console.log('📝 AI Response preview:', aiResponse.substring(0, 100));
      
//       const audioFilePath = await textToSpeechTool(aiResponse);
//       console.log('🎵 Audio file path returned:', audioFilePath);
      
//       if (audioFilePath) {
//         // Check if file actually exists
//         const fs = require('fs');
//         const fileExists = fs.existsSync(audioFilePath);
//         console.log('📁 Audio file exists on disk:', fileExists);
        
//         if (fileExists) {
//           audioUrl = await storeAudioFile(message._id.toString(), audioFilePath);
//           console.log('☁️ Audio uploaded to storage:', audioUrl);
          
//           if (audioUrl) {
//             // Update both records
//             message.audioUrl = audioUrl;
//             message.metadata.audioGenerated = true;
//             await message.save();

//             agentRecord.metadata.audioUrl = audioUrl;
//             agentRecord.metadata.audioGenerated = true;
//             await agentRecord.save();
            
//             console.log('✅ Audio URL updated in database');
//           } else {
//             console.error('❌ storeAudioFile returned null');
//           }
//         } else {
//           console.error('❌ Audio file was not created on disk');
//         }
//       } else {
//         console.error('❌ textToSpeechTool returned null');
//       }
//     } catch (audioError) {
//       console.error('❌ Audio generation failed:', audioError.message);
//       console.error('❌ Full error:', audioError);
      
//       // Update records to show failure
//       message.metadata.audioGenerated = false;
//       await message.save();
      
//       agentRecord.metadata.audioUrl = null;
//       agentRecord.metadata.audioGenerated = false;
//       agentRecord.metadata.audioError = audioError.message;
//       await agentRecord.save();
//     }

//     // 10. Notify family if urgent
//     if (isUrgent) {
//       await notifyFamilyMembers(sender, message, isUrgent);
//       message.notificationsSent = true;
//       await message.save();
//     }

//     // 11. Final metadata update
//     const finalProcessingTime = Date.now() - startTime;
//     message.metadata.processingTime = finalProcessingTime;
//     agentRecord.metadata.processingTime = finalProcessingTime;

//     await message.save();
//     await agentRecord.save();

//     return {
//       messageId: message._id,
//       agentId: agentRecord._id,
//       aiResponse,
//       audioUrl,
//       urgency: isUrgent,
//       transcript,
//       familyNotified: isUrgent,
//       taskCreated,
//       taskId: createdTask ? createdTask._id : null,
//       processingTime: finalProcessingTime
//     };

//   } catch (error) {
//     console.error('❌ Error processing message:', error.message);
//     return {
//       success: false,
//       error: 'Message processing failed',
//       details: error.message
//     };
//   }
// };

// const processMessage = async (senderId, transcript) => {
//   try {
//     console.log('🎙️ Processing message for user:', senderId);
//     console.log('🎙️ Transcript:', transcript);

//     // 1. Analyze urgency and detect task using LLM
//     const analysisPrompt = `Analyze the following message for urgency and task detection. Return JSON format:
//     {
//       "urgency": "urgent" or "normal",
//       "taskDetected": true/false,
//       "taskType": "food_order" or "medication" or "general_task" or null,
//       "title": "short task title" or null
//     }
    
//     Message: "${transcript}"
    
//     Mark as urgent if message contains words like: help, emergency, urgent, asap, immediately, now
//     Detect food_order if message mentions: order, food, eat, hungry, meal, restaurant, delivery
//     Detect medication if message mentions: medicine, medication, pills, pharmacy, doctor`;

//     // ✅ Enhanced LLM response handling
//     let analysis;
//     try {
//       const llmResponse = await tracedChatTool(analysisPrompt);
//       console.log('🧠 LLM Response received:', llmResponse);
      
//       analysis = JSON.parse(llmResponse);
//       console.log('✅ Analysis parsed successfully:', analysis);
      
//     } catch (llmError) {
//       console.error('💥 LLM or JSON parsing error:', llmError);
      
//       // ✅ Fallback analysis using simple keyword detection
//       console.log('🔧 Using fallback analysis...');
//       const lowerTranscript = transcript.toLowerCase();
      
//       analysis = {
//         urgency: (lowerTranscript.includes('urgent') || lowerTranscript.includes('emergency') || 
//                  lowerTranscript.includes('help') || lowerTranscript.includes('asap')) ? "urgent" : "normal",
//         taskDetected: (lowerTranscript.includes('order') || lowerTranscript.includes('food') || 
//                       lowerTranscript.includes('eat') || lowerTranscript.includes('hungry') ||
//                       lowerTranscript.includes('medicine') || lowerTranscript.includes('medication')),
//         taskType: null,
//         title: null
//       };
      
//       if (analysis.taskDetected) {
//         if (lowerTranscript.includes('order') || lowerTranscript.includes('food') || 
//             lowerTranscript.includes('eat') || lowerTranscript.includes('hungry')) {
//           analysis.taskType = "food_order";
//           analysis.title = "Food order request";
//         } else if (lowerTranscript.includes('medicine') || lowerTranscript.includes('medication')) {
//           analysis.taskType = "medication";
//           analysis.title = "Medication request";
//         } else {
//           analysis.taskType = "general_task";
//           analysis.title = "General assistance request";
//         }
//       }
      
//       console.log('🔧 Fallback analysis result:', analysis);
//     }
    
//     let orderSummary = null;
//     let orderPlaced = false;
//     let totalPrice = 0;
//     let newWalletBalance = 0;
//     let order = null;
//     let product = null;

//     // 2. Handle food order task with complete order processing
//     if (analysis.taskType === 'food_order') {
//       console.log('🍽️ Processing food order...');
      
//       product = await matchProductInDb(transcript);
      
//       if (product) {
//         console.log('📦 Product found:', product.name, 'Price:', product.price);
        
//         const session = await mongoose.startSession();
        
//         try {
//           await session.withTransaction(async () => {
//             const profile = await UserProfile.findOne({ userId: senderId }).session(session);
//             const user = await User.findById(senderId).session(session);
            
//             if (!profile || !user) {
//               throw new Error('User or profile not found');
//             }
            
//             console.log('💰 Wallet balance:', profile.wallet.balance, 'Product price:', product.price);
            
//             if (profile.wallet.balance >= product.price) {
//               // Create order data
//               const orderData = {
//                 userId: senderId,
//                 items: [{
//                   productId: product.id,
//                   name: product.name,
//                   price: product.price,
//                   quantity: 1,
//                   image: product.image,
//                   category: product.category,
//                   poweredBy: product.poweredBy
//                 }],
//                 totalAmount: product.price,
//                 paymentMethod: 'wallet',
//                 paymentStatus: 'completed',
//                 deliveryAddress: {
//                   street: profile.address.street,
//                   city: profile.address.city,
//                   state: profile.address.state,
//                   zipCode: profile.address.zipCode,
//                   landmark: profile.address.landmark || ''
//                 },
//                 originalTranscript: transcript,
//                 placedViaVoice: true,
//                 contactNumber: user.phoneNumber,
//                 status: 'confirmed',
//                 confirmedAt: new Date(),
//                 estimatedDelivery: product.category === 'food' ? '30-45 mins' : 
//                                  product.category === 'medicine' ? '1-2 hours' : '15-30 mins'
//               };

//               // Create order
//               order = new Order(orderData);
              
//               // Create transaction record for wallet deduction
//               const transaction = new Transaction({
//                 fromUser: senderId,
//                 type: 'debit',
//                 category: 'shopping',
//                 amount: product.price,
//                 description: `Voice order payment for ${product.name}`,
//                 paymentMethod: 'wallet',
//                 balanceBefore: {
//                   fromUserBalance: profile.wallet.balance
//                 },
//                 balanceAfter: {
//                   fromUserBalance: profile.wallet.balance - product.price
//                 },
//                 metadata: {
//                   orderId: order.orderId,
//                   productName: product.name,
//                   orderType: 'voice_order',
//                   transcript: transcript
//                 },
//                 status: 'completed',
//                 completedAt: new Date()
//               });
              
//               // Deduct from wallet
//               profile.wallet.balance -= product.price;
//               profile.wallet.lastTransactionAt = new Date();
              
//               // Update activity stats
//               profile.activityStats.lastActive = new Date();
              
//               // Save all changes in transaction
//               await Promise.all([
//                 order.save({ session }),
//                 transaction.save({ session }),
//                 profile.save({ session })
//               ]);
              
//               orderSummary = `Order placed successfully! ${product.name} for ₹${product.price}. Order ID: ${order.orderId}. Estimated delivery: ${order.estimatedDelivery}`;
//               orderPlaced = true;
//               totalPrice = product.price;
//               newWalletBalance = profile.wallet.balance;
              
//               console.log('✅ Order placed successfully:', order.orderId);
              
//             } else {
//               orderSummary = `Insufficient wallet balance to place order for ${product.name}. Required: ₹${product.price}, Available: ₹${profile.wallet.balance}. Please add money to your wallet.`;
//               console.log('❌ Insufficient balance');
//             }
//           });
//         } finally {
//           await session.endSession();
//         }
//       } else {
//         orderSummary = `I couldn't find the specific food item you mentioned in our catalog. I've created a task for your family to help you order it manually.`;
//         console.log('❌ Product not found in catalog');
//       }
//     }

//     // 3. Generate AI response based on order status
//     let aiResponse = "Thank you for your message.";
    
//     if (orderPlaced) {
//       aiResponse = `Great! I've placed your order for ${product.name} successfully. It costs ₹${totalPrice} and will be delivered in ${order.estimatedDelivery}. Your remaining wallet balance is ₹${newWalletBalance}.`;
//     } else if (analysis.taskDetected && analysis.taskType === 'food_order') {
//       if (orderSummary && orderSummary.includes('Insufficient')) {
//         aiResponse = `I understand you want to order food, but you don't have enough balance in your wallet. ${orderSummary} Your family has been notified to help you.`;
//       } else {
//         aiResponse = `I've created a food ordering task for you. ${orderSummary} Your family will be notified to help you with this.`;
//       }
//     } else if (analysis.taskDetected) {
//       aiResponse = `I've created a task: ${analysis.title}. Your family will be notified to help you.`;
//     } else {
//       aiResponse = "I understand your message. Is there anything specific I can help you with?";
//     }

//     console.log('🤖 AI Response generated:', aiResponse);

//     // 4. Create Agent and Message records
//     const agent = await Agent.create({
//       userId: senderId,
//       name: 'AI Assistant',
//       type: 'voice_assistant',
//       lastActive: new Date()
//     });

//     const message = await Message.create({
//       sender: senderId,
//       content: transcript,
//       response: aiResponse,
//       agentId: agent._id,
//       urgency: analysis.urgency,
//       taskDetected: analysis.taskDetected,
//       orderPlaced: orderPlaced,
//       orderSummary: orderSummary,
//       orderAmount: totalPrice,
//       timestamp: new Date()
//     });

//     // 5. Create task if detected
//     if (analysis.taskDetected) {
//       const task = await Task.create({
//         userId: senderId,
//         title: analysis.title,
//         description: transcript,
//         type: analysis.taskType,
//         urgency: analysis.urgency,
//         status: orderPlaced ? 'completed' : 'pending',
//         orderSummary: orderSummary,
//         orderAmount: totalPrice,
//         messageId: message._id,
//         createdAt: new Date()
//       });
      
//       // Update message with task ID
//       message.taskId = task._id;
//       await message.save();
//     }

//     // 6. Generate audio using TTS (with error handling)
//     try {
//       const audioBuffer = await textToSpeechTool(aiResponse);
//       const audioUrl = await storeAudioFile(audioBuffer, `message_${message._id}.mp3`);
      
//       message.audioUrl = audioUrl;
//       await message.save();
//     } catch (audioError) {
//       console.error('💥 Audio generation failed:', audioError);
//       // Continue without audio
//     }

//     // 7. Get user for notifications
//     const user = await User.findById(senderId).populate('groups');

//     // 8. Notify family members if urgent
//     if (analysis.urgency === 'urgent') {
//       try {
//         const urgentMessage = `🚨 URGENT: ${user.name} needs immediate help: "${transcript}"`;
        
//         // Notify all groups the user belongs to
//         for (const group of user.groups) {
//           await notifyGroupMembers(group._id, urgentMessage);
//         }
        
//         // Also notify family members directly
//         await notifyFamilyMembers(senderId, urgentMessage);
//       } catch (notifyError) {
//         console.error('💥 Urgent notification failed:', notifyError);
//       }
//     }

//     // 9. Notify family for tasks (including successful orders)
//     if (analysis.taskDetected) {
//       try {
//         let notificationMessage;
        
//         if (orderPlaced) {
//           notificationMessage = `✅ ${user.name} successfully placed a voice order for ${product.name} (₹${totalPrice}). Order ID: ${order.orderId}. Estimated delivery: ${order.estimatedDelivery}`;
//         } else if (analysis.taskType === 'food_order' && orderSummary && orderSummary.includes('Insufficient')) {
//           notificationMessage = `💳 ${user.name} tried to order food but has insufficient wallet balance. ${orderSummary}`;
//         } else {
//           notificationMessage = `📝 ${user.name} needs help with: ${analysis.title}. ${orderSummary || 'Please check the task details.'}`;
//         }
        
//         await notifyFamilyMembers(senderId, notificationMessage);
//       } catch (notifyError) {
//         console.error('💥 Family notification failed:', notifyError);
//       }
//     }

//     return {
//       success: true,
//       message: message,
//       agent: agent,
//       orderPlaced: orderPlaced,
//       orderDetails: orderPlaced ? {
//         orderId: order.orderId,
//         productName: product.name,
//         amount: totalPrice,
//         estimatedDelivery: order.estimatedDelivery,
//         newWalletBalance: newWalletBalance
//       } : null,
//       urgency: analysis.urgency,
//       taskDetected: analysis.taskDetected,
//       aiResponse: aiResponse,
//       audioUrl: message.audioUrl || null
//     };

//   } catch (error) {
//     console.error('💥 Error processing message:', error);
    
//     // Create fallback response
//     const fallbackResponse = "I received your message but encountered an issue processing it. Your family has been notified to help you.";
    
//     try {
//       const agent = await Agent.create({
//         userId: senderId,
//         name: 'AI Assistant',
//         type: 'voice_assistant'
//       });

//       const message = await Message.create({
//         sender: senderId,
//         content: transcript,
//         response: fallbackResponse,
//         agentId: agent._id,
//         error: error.message,
//         timestamp: new Date()
//       });

//       // Generate fallback audio
//       try {
//         const audioBuffer = await textToSpeechTool(fallbackResponse);
//         const audioUrl = await storeAudioFile(audioBuffer, `message_${message._id}.mp3`);
        
//         message.audioUrl = audioUrl;
//         await message.save();
//       } catch (audioError) {
//         console.error('💥 Fallback audio generation failed:', audioError);
//       }

//       // Notify family about the issue
//       try {
//         const user = await User.findById(senderId);
//         await notifyFamilyMembers(senderId, `⚠️ ${user?.name || 'User'} sent a message but the system encountered an issue: "${transcript}". Please check on them.`);
//       } catch (notifyError) {
//         console.error('💥 Fallback notification failed:', notifyError);
//       }

//       return {
//         success: false,
//         message: message,
//         agent: agent,
//         error: error.message,
//         aiResponse: fallbackResponse,
//         audioUrl: message.audioUrl || null
//       };
//     } catch (fallbackError) {
//       console.error('💥 Fallback error:', fallbackError);
      
//       // Ultimate fallback
//       return {
//         success: false,
//         error: fallbackError.message,
//         aiResponse: fallbackResponse
//       };
//     }
//   }
// };


// Helper function to match products in database
// const matchProductInDb = async (transcript) => {
//   try {
//     // Import product data from your dummy data
//     const { allItems } = require('../data/dummyData');
    
//     // Clean and normalize transcript
//     const normalizedTranscript = transcript.toLowerCase().trim();
    
//     // Keywords for food ordering
//     const orderKeywords = ['order', 'want', 'need', 'get', 'buy', 'deliver', 'hungry', 'eat'];
//     const hasOrderIntent = orderKeywords.some(keyword => normalizedTranscript.includes(keyword));
    
//     if (!hasOrderIntent) return null;
    
//     // Search for product matches with scoring system
//     const matches = allItems.map(item => {
//       const itemName = item.name.toLowerCase();
//       const itemDescription = item.description.toLowerCase();
//       let score = 0;
      
//       // Direct name match (highest score)
//       if (normalizedTranscript.includes(itemName)) {
//         score += 100;
//       }
      
//       // Partial word matches
//       const transcriptWords = normalizedTranscript.split(' ');
//       const nameWords = itemName.split(' ');
      
//       const matchCount = nameWords.filter(nameWord => 
//         transcriptWords.some(transcriptWord => 
//           transcriptWord.includes(nameWord) || nameWord.includes(transcriptWord)
//         )
//       ).length;
      
//       // Score based on word matches
//       score += (matchCount / nameWords.length) * 50;
      
//       // Description match for key ingredients
//       const descriptionMatches = itemDescription.split(' ').filter(word => 
//         transcriptWords.includes(word) && word.length > 3
//       ).length;
      
//       score += descriptionMatches * 10;
      
//       // Category bonus for food items if food-related words are mentioned
//       const foodWords = ['food', 'eat', 'meal', 'dinner', 'lunch', 'breakfast'];
//       if (item.category === 'food' && foodWords.some(word => normalizedTranscript.includes(word))) {
//         score += 20;
//       }
      
//       return { ...item, matchScore: score };
//     }).filter(item => item.matchScore > 20); // Only return items with decent match scores
    
//     // Return best match (highest score)
//     if (matches.length > 0) {
//       const bestMatch = matches.sort((a, b) => b.matchScore - a.matchScore)[0];
//       console.log('🎯 Product matched:', bestMatch.name, 'Score:', bestMatch.matchScore, 'Price:', bestMatch.price);
//       return bestMatch;
//     }
    
//     console.log('❌ No product match found for:', transcript);
//     return null;
    
//   } catch (error) {
//     console.error('💥 Error in matchProductInDb:', error);
//     return null;
//   }
// };
const UserProfile= require('../models/profile');
const Transaction = require('../models/transaction');
const axios = require('axios');

// const processMessage = async (senderId, transcript) => {
//   const startTime = Date.now();

//   try {
//     console.log('🎙️ Processing message for user:', senderId);
//     console.log('🎙️ Transcript:', transcript);

//     // 1. Analyze urgency using LLM
//     const urgencyPrompt = `Analyze the following message from an elderly person and determine if it indicates an urgent situation requiring immediate family attention. Consider health emergencies, safety concerns, distress, or immediate needs. Reply with only 'urgent' or 'not urgent'. Message: "${transcript}"`;

//     const urgencyResponse = await tracedChatTool(urgencyPrompt);
//     const isUrgent = urgencyResponse.toLowerCase().includes('urgent');

//     // 2. Find sender user
//     const sender = await User.findById(senderId);
//     if (!sender) throw new Error('Sender not found');

//     // 3. Task detection
//     const taskDetectionPrompt = `Does this message from an elderly person request something that requires PHYSICAL ACTION by a family member?

// Examples that need PHYSICAL ACTION (answer YES):
// - "I want to order bread" → Family needs to order
// - "I need medicine" → Family needs to get medicine
// - "Book me an appointment" → Family needs to call/book
// - "I'm hungry" → Family needs to get food
// - "Can you get groceries" → Family needs to shop
// - "Order dal makhani" → Food ordering needed
// - "I want pizza" → Food ordering needed

// Examples that DON'T need physical action (answer NO):
// - "How are you?" → Just conversation
// - "What time is it?" → Information only
// - "Tell me a joke" → Entertainment only

// Message: "${transcript}"

// Answer only YES or NO:`;

//     const taskDetectionResponse = await tracedChatTool(taskDetectionPrompt);
//     const hasTask = taskDetectionResponse.toLowerCase().includes('yes');
    
//     console.log('🧠 Task detection response:', taskDetectionResponse, 'hasTask:', hasTask);

//     // 4. Get task details if task detected
//     let taskAnalysis = null;
//     let orderPlaced = false;
//     let orderDetails = null;
    
//     if (hasTask) {
//       const detailPrompt = `The message "${transcript}" requires family help. Categorize it:

// What type of help is needed?
// - food_order (ordering food, groceries, restaurants, dal makhani, pizza, etc.)
// - medication (medicine, pills, pharmacy)
// - appointment (doctor, dentist, services)
// - emergency (urgent health/safety)
// - general (other physical help)

// What would be a short title for this task?

// Reply in this format:
// TYPE: [category]
// TITLE: [short title]`;

//       const detailResponse = await tracedChatTool(detailPrompt);
//       console.log('🧠 Detail response received:', detailResponse);
      
//       // Enhanced parsing that handles JSON responses
//       let taskType = 'general';
//       let title = 'Help needed';
      
//       try {
//         const jsonResponse = JSON.parse(detailResponse);
//         console.log('📋 Parsed as JSON:', jsonResponse);
        
//         if (jsonResponse.TYPE) {
//           taskType = jsonResponse.TYPE.toLowerCase();
//           title = jsonResponse.TITLE || title;
//           console.log('✅ Extracted from JSON - Type:', taskType, 'Title:', title);
//         } else if (jsonResponse.taskType) {
//           taskType = jsonResponse.taskType.toLowerCase();
//           title = jsonResponse.title || title;
//           console.log('✅ Extracted from alt JSON - Type:', taskType, 'Title:', title);
//         }
//       } catch (parseError) {
//         console.log('📋 JSON parse failed, trying regex...');
//         const typeMatch = detailResponse.match(/TYPE:\s*(\w+)/i);
//         const titleMatch = detailResponse.match(/TITLE:\s*(.+)/i);
        
//         if (typeMatch) {
//           taskType = typeMatch[1].toLowerCase();
//           console.log('✅ Regex extracted type:', taskType);
//         }
//         if (titleMatch) {
//           title = titleMatch[1].trim();
//           console.log('✅ Regex extracted title:', title);
//         }
        
//         if (taskType === 'general') {
//           const lowerResponse = detailResponse.toLowerCase();
//           if (lowerResponse.includes('food') || lowerResponse.includes('order') || 
//               lowerResponse.includes('dal') || lowerResponse.includes('makhani')) {
//             taskType = 'food_order';
//             title = 'Food order request';
//             console.log('✅ Keyword fallback - detected food order');
//           }
//         }
//       }
      
//       taskAnalysis = {
//         hasTask: true,
//         taskType: taskType,
//         title: title,
//         description: transcript
//       };

//       console.log('🧠 Final task analysis result:', taskAnalysis);

//       // Handle food orders with wallet deduction
//       if (taskAnalysis.taskType === 'food_order') {
//         console.log('🍽️ Processing food order for:', taskAnalysis.title);
        
//         const product = await matchProductInDb(transcript);
        
//         if (product) {
//           console.log('📦 Product found:', product.name, 'Price:', product.price);
          
//           const session = await mongoose.startSession();
          
//           try {
//             await session.withTransaction(async () => {
//               const profile = await UserProfile.findOne({ userId: senderId }).session(session);
              
//               if (!profile) {
//                 throw new Error('User profile not found');
//               }
              
//               console.log('💰 Wallet balance:', profile.wallet.balance, 'Product price:', product.price);
              
//               if (profile.wallet.balance >= product.price) {
//                 const orderData = {
//                   userId: senderId,
//                   items: [{
//                     productId: product.id,  // ✅ Use numeric ID directly
//                     name: String(product.name),
//                     price: Number(product.price),
//                     quantity: 1,
//                     image: product.image || 'https://via.placeholder.com/150',
//                     category: product.partner === 'swiggy' ? 'food' : 'groceries',
//                     poweredBy: product.partner || 'Unknown'
//                   }],
//                   totalAmount: Number(product.price),
//                   paymentMethod: 'wallet',
//                   paymentStatus: 'completed',
//                   deliveryAddress: {
//                     street: profile.address?.street || 'Not provided',
//                     city: profile.address?.city || 'Not provided',
//                     state: profile.address?.state || 'Not provided',
//                     zipCode: profile.address?.zipCode || '000000'
//                   },
//                   originalTranscript: transcript,
//                   placedViaVoice: true,
//                   contactNumber: sender.phoneNumber,
//                   status: 'confirmed',
//                   confirmedAt: new Date(),
//                   estimatedDelivery: product.partner === 'swiggy' ? '30-45 mins' : '15-30 mins'
//                 };

//                 const order = new Order(orderData);
                
//                 const transaction = new Transaction({
//                   fromUser: senderId,
//                   type: 'debit',
//                   category: 'shopping',
//                   amount: product.price,
//                   description: `Voice order: ${product.name}`,
//                   paymentMethod: 'wallet',
//                   balanceBefore: {
//                     fromUserBalance: profile.wallet.balance
//                   },
//                   balanceAfter: {
//                     fromUserBalance: profile.wallet.balance - product.price
//                   },
//                   metadata: {
//                     orderId: order.orderId,
//                     productName: product.name,
//                     orderType: 'voice_order',
//                     partner: product.partner
//                   },
//                   status: 'completed',
//                   completedAt: new Date()
//                 });
                
//                 profile.wallet.balance -= product.price;
//                 profile.wallet.lastTransactionAt = new Date();
                
//                 await Promise.all([
//                   order.save({ session }),
//                   transaction.save({ session }),
//                   profile.save({ session })
//                 ]);
                
//                 orderPlaced = true;
//                 orderDetails = {
//                   orderId: order.orderId,
//                   productName: product.name,
//                   amount: product.price,
//                   estimatedDelivery: order.estimatedDelivery,
//                   newWalletBalance: profile.wallet.balance,
//                   partner: product.partner
//                 };
                
//                 taskAnalysis.title = `Order placed: ${product.name}`;
//                 taskAnalysis.description = `Successfully ordered ${product.name} for ₹${product.price} via ${product.partner}`;
                
//                 console.log('✅ Order placed successfully:', order.orderId);
                
//               } else {
//                 console.log('❌ Insufficient balance');
//                 taskAnalysis.title = `Insufficient balance for ${product.name}`;
//                 taskAnalysis.description = `Wanted to order ${product.name} (₹${product.price}) but only has ₹${profile.wallet.balance}`;
//               }
//             });
//           } finally {
//             await session.endSession();
//           }
//         } else {
//           console.log('❌ Product not found in catalog');
//           taskAnalysis.title = 'Food order - item not found';
//           taskAnalysis.description = `Requested food item not found in catalog: ${transcript}`;
//         }
//       }
//     }

//     // 5. Generate appropriate AI response
//     let aiResponse = '';
//     if (hasTask && taskAnalysis) {
//       if (orderPlaced) {
//         aiResponse = `Great! I've placed your order for ${orderDetails.productName} via ${orderDetails.partner}. It costs ₹${orderDetails.amount} and will be delivered in ${orderDetails.estimatedDelivery}. Your remaining balance is ₹${orderDetails.newWalletBalance}.`;
//         console.log('✅ Generated order success response');
//       } else if (taskAnalysis.taskType === 'food_order' && taskAnalysis.title.includes('Insufficient')) {
//         aiResponse = `I understand you want to order food, but you don't have enough balance in your wallet. Your family has been notified to help you add money.`;
//         console.log('✅ Generated insufficient balance response');
//       } else if (taskAnalysis.taskType === 'food_order' && taskAnalysis.title.includes('not found')) {
//         aiResponse = `I couldn't find that specific item in our menu. I've created a task for your family to help you order it manually.`;
//         console.log('✅ Generated product not found response');
//       } else {
//         const taskConfirmationPrompt = `You are a helpful AI assistant speaking to an elderly person. You have just created a task called "${taskAnalysis.title}" and their family will help them.

// Respond with exactly ONE short, warm, respectful message (1-2 sentences only). 

// IMPORTANT: Mention that you have "created a task" or "set up a task" in your response.

// Be caring but treat them with dignity. Do not use words like "dear" or sound condescending. Speak to them as you would to any adult.

// Your response:`;

//         aiResponse = await tracedChatTool(taskConfirmationPrompt);
//         console.log('✅ Generated general task response');
//       }
//     } else {
//       const responsePrompt = `Reply to this elderly person in exactly 1 short, friendly sentence: "${transcript}"`;
//       aiResponse = await tracedChatTool(responsePrompt);
//       console.log('✅ Generated conversational response');
//     }

//     console.log('🤖 AI Response generated:', aiResponse);

//     // 6. Generate audio response
//     let audioUrl = null;
//     try {
//       const audioBuffer = await textToSpeech(aiResponse);
//       const fileName = `response_${Date.now()}.mp3`;
//       audioUrl = await uploadToS3(audioBuffer, fileName, 'audio/mpeg');
//       console.log('✅ Audio generated and uploaded:', audioUrl);
//     } catch (audioError) {
//       console.error('❌ Audio generation failed:', audioError);
//     }

//     // 7. Get family member count for metadata
//     let familyMemberCount = 0;
//     try {
//       const familyMembers = await User.find({ 
//         role: 'family',
//         'elderlyConnections.elderId': senderId,
//         'elderlyConnections.status': 'active'
//       });
//       familyMemberCount = familyMembers.length;
//     } catch (error) {
//       console.log('❌ Error getting family member count:', error);
//     }

//     // 8. Save message (✅ ADAPTED TO YOUR EXISTING SCHEMA)
//     console.log('🔍 Message creation debug:', {
//       senderId: senderId,
//       transcript: transcript,
//       aiResponse: aiResponse,
//       transcriptType: typeof transcript,
//       aiResponseType: typeof aiResponse,
//       transcriptLength: transcript?.length,
//       aiResponseLength: aiResponse?.length
//     });

//     const message = new Message({
//       senderId: senderId,
//       transcript: transcript,                 // ✅ Required field in your schema
//       aiResponse: aiResponse,                 // ✅ Required field in your schema
//       audioUrl: audioUrl,                     // ✅ Optional audio URL
//       urgencyFlag: isUrgent,                  // ✅ Boolean urgency flag
//       familyMemberRoles: [],                  // ✅ Empty array for now
//       notificationsSent: isUrgent || orderPlaced,  // ✅ Set based on urgency/order
//       readBy: [],                             // ✅ Empty array initially
//       metadata: {
//         urgency: isUrgent ? 'urgent' : 'not urgent',
//         senderName: sender.name,
//         familyMemberCount: familyMemberCount,
//         processingTime: Date.now() - startTime,
//         audioGenerated: !!audioUrl
//       }
//     });

//     await message.save();
//     console.log('✅ Message saved:', message._id);

//     // 9. Create task if needed (store task info in metadata for reference)
//     let taskCreated = false;
//     let createdTask = null;
    
//     if (hasTask && taskAnalysis && !orderPlaced) {
//       try {
//         const familyMembers = await User.find({ 
//           role: 'family',
//           'elderlyConnections.elderId': senderId,
//           'elderlyConnections.status': 'active'
//         });

//         if (familyMembers.length > 0) {
//           const newTask = new Task({
//             title: taskAnalysis.title,
//             description: taskAnalysis.description,
//             type: taskAnalysis.taskType,
//             priority: isUrgent ? 'urgent' : 'normal',
//             status: 'pending',
//             assignedTo: familyMembers.map(fm => fm._id),
//             createdBy: senderId,
//             elderlyUserId: senderId,
//             voiceMessageId: message._id,  // ✅ Reference to the message
//             originalTranscript: transcript,
//             createdViaVoice: true
//           });

//           createdTask = await newTask.save();
//           taskCreated = true;
//           console.log('✅ Task created:', createdTask._id);
//         }
//       } catch (taskError) {
//         console.error('❌ Error creating task:', taskError);
//       }
//     }

//     // 10. Send notifications if urgent or order placed
//     if (isUrgent || orderPlaced) {
//       try {
//         const familyMembers = await User.find({ 
//           role: 'family',
//           'elderlyConnections.elderId': senderId,
//           'elderlyConnections.status': 'active'
//         });

//         const notificationPromises = familyMembers.map(async (familyMember) => {
//           const notification = new Notification({
//             userId: familyMember._id,
//             title: orderPlaced ? 'Order Placed' : 'Urgent Message',
//             message: orderPlaced ? 
//               `${sender.name} ordered ${orderDetails.productName} for ₹${orderDetails.amount}` :
//               `Urgent message from ${sender.name}: ${transcript}`,
//             type: orderPlaced ? 'order' : 'urgent',
//             relatedUser: senderId,
//             messageId: message._id,
//             taskId: createdTask?._id || null,
//             orderDetails: orderDetails
//           });
          
//           return notification.save();
//         });

//         await Promise.all(notificationPromises);
//         console.log('✅ Family notifications sent');
//       } catch (notificationError) {
//         console.error('❌ Error sending notifications:', notificationError);
//       }
//     }

//     const finalProcessingTime = Date.now() - startTime;
//     console.log(`✅ Message processing completed in ${finalProcessingTime}ms`);

//     return {
//       messageId: message._id,
//       aiResponse,
//       audioUrl,
//       urgency: isUrgent,
//       transcript,
//       familyNotified: isUrgent || orderPlaced,
//       taskCreated,
//       taskId: createdTask ? createdTask._id : null,
//       orderPlaced,
//       orderDetails,
//       processingTime: finalProcessingTime
//     };

//   } catch (error) {
//     console.error('❌ Error processing message:', error.message);
//     return {
//       success: false,
//       error: 'Message processing failed',
//       details: error.message
//     };
//   }
// };



const processMessage = async (senderId, transcript) => {
  const startTime = Date.now();

  try {
    console.log('🎙️ Processing message for user:', senderId);
    console.log('🎙️ Transcript:', transcript);

    // 1. Analyze urgency using LLM
    const urgencyPrompt = `Analyze the following message from an elderly person and determine if it indicates an urgent situation requiring immediate family attention. Consider health emergencies, safety concerns, distress, or immediate needs. Reply with only 'urgent' or 'not urgent'. Message: "${transcript}"`;

    const urgencyResponse = await tracedChatTool(urgencyPrompt);
    const isUrgent = urgencyResponse.toLowerCase().includes('urgent');

    // 2. Find sender user
    const sender = await User.findById(senderId);
    if (!sender) throw new Error('Sender not found');

    // 3. Task detection
    const taskDetectionPrompt = `Does this message from an elderly person request something that requires PHYSICAL ACTION by a family member?

Examples that need PHYSICAL ACTION (answer YES):
- "I want to order bread" → Family needs to order
- "I need medicine" → Family needs to get medicine
- "Book me an appointment" → Family needs to call/book
- "I'm hungry" → Family needs to get food
- "Can you get groceries" → Family needs to shop
- "Order dal makhani" → Food ordering needed
- "I want pizza" → Food ordering needed

Examples that DON'T need physical action (answer NO):
- "How are you?" → Just conversation
- "What time is it?" → Information only
- "Tell me a joke" → Entertainment only

Message: "${transcript}"

Answer only YES or NO:`;

    const taskDetectionResponse = await tracedChatTool(taskDetectionPrompt);
    const hasTask = taskDetectionResponse.toLowerCase().includes('yes');
    
    console.log('🧠 Task detection response:', taskDetectionResponse, 'hasTask:', hasTask);

    // 4. Get task details if task detected
    let taskAnalysis = null;
    let orderPlaced = false;
    let orderDetails = null;
    
    if (hasTask) {
      const detailPrompt = `The message "${transcript}" requires family help. Categorize it:

What type of help is needed?
- food_order (ordering food, groceries, restaurants, dal makhani, pizza, etc.)
- medication (medicine, pills, pharmacy)
- appointment (doctor, dentist, services)
- emergency (urgent health/safety)
- general (other physical help)

What would be a short title for this task?

Reply in this format:
TYPE: [category]
TITLE: [short title]`;

      const detailResponse = await tracedChatTool(detailPrompt);
      console.log('🧠 Detail response received:', detailResponse);
      
      // Enhanced parsing that handles JSON responses
      let taskType = 'general';
      let title = 'Help needed';
      
      try {
        const jsonResponse = JSON.parse(detailResponse);
        console.log('📋 Parsed as JSON:', jsonResponse);
        
        if (jsonResponse.TYPE) {
          taskType = jsonResponse.TYPE.toLowerCase();
          title = jsonResponse.TITLE || title;
          console.log('✅ Extracted from JSON - Type:', taskType, 'Title:', title);
        } else if (jsonResponse.taskType) {
          taskType = jsonResponse.taskType.toLowerCase();
          title = jsonResponse.title || title;
          console.log('✅ Extracted from alt JSON - Type:', taskType, 'Title:', title);
        }
      } catch (parseError) {
        console.log('📋 JSON parse failed, trying regex...');
        const typeMatch = detailResponse.match(/TYPE:\s*(\w+)/i);
        const titleMatch = detailResponse.match(/TITLE:\s*(.+)/i);
        
        if (typeMatch) {
          taskType = typeMatch[1].toLowerCase();
          console.log('✅ Regex extracted type:', taskType);
        }
        if (titleMatch) {
          title = titleMatch[1].trim();
          console.log('✅ Regex extracted title:', title);
        }
        
        if (taskType === 'general') {
          const lowerResponse = detailResponse.toLowerCase();
          if (lowerResponse.includes('food') || lowerResponse.includes('order') || 
              lowerResponse.includes('dal') || lowerResponse.includes('makhani')) {
            taskType = 'food_order';
            title = 'Food order request';
            console.log('✅ Keyword fallback - detected food order');
          }
        }
      }
      
      taskAnalysis = {
        hasTask: true,
        taskType: taskType,
        title: title,
        description: transcript
      };

      console.log('🧠 Final task analysis result:', taskAnalysis);

      // Handle food orders with wallet deduction
      if (taskAnalysis.taskType === 'food_order') {
        console.log('🍽️ Processing food order for:', taskAnalysis.title);
        
        const product = await matchProductInDb(transcript);
        
        if (product) {
          console.log('📦 Product found:', product.name, 'Price:', product.price);
          
          const session = await mongoose.startSession();
          
          try {
            await session.withTransaction(async () => {
              const profile = await UserProfile.findOne({ userId: senderId }).session(session);
              
              if (!profile) {
                throw new Error('User profile not found');
              }
              
              console.log('💰 Wallet balance:', profile.wallet.balance, 'Product price:', product.price);
              
              if (profile.wallet.balance >= product.price) {
                const orderData = {
                  userId: senderId,
                  items: [{
                    productId: product.id,
                    name: String(product.name),
                    price: Number(product.price),
                    quantity: 1,
                    image: product.image || 'https://via.placeholder.com/150',
                    category: product.partner === 'swiggy' ? 'food' : 'groceries',
                    poweredBy: product.partner || 'Unknown'
                  }],
                  totalAmount: Number(product.price),
                  paymentMethod: 'wallet',
                  paymentStatus: 'completed',
                  deliveryAddress: {
                    street: profile.address?.street || 'Not provided',
                    city: profile.address?.city || 'Not provided',
                    state: profile.address?.state || 'Not provided',
                    zipCode: profile.address?.zipCode || '000000'
                  },
                  originalTranscript: transcript,
                  placedViaVoice: true,
                  contactNumber: sender.phoneNumber,
                  status: 'confirmed',
                  confirmedAt: new Date(),
                  estimatedDelivery: product.partner === 'swiggy' ? '30-45 mins' : '15-30 mins'
                };

                const order = new Order(orderData);
                
                const transaction = new Transaction({
                  fromUser: senderId,
                  type: 'debit',
                  category: 'shopping',
                  amount: product.price,
                  description: `Voice order: ${product.name}`,
                  paymentMethod: 'wallet',
                  balanceBefore: {
                    fromUserBalance: profile.wallet.balance
                  },
                  balanceAfter: {
                    fromUserBalance: profile.wallet.balance - product.price
                  },
                  metadata: {
                    orderId: order.orderId,
                    productName: product.name,
                    orderType: 'voice_order',
                    partner: product.partner
                  },
                  status: 'completed',
                  completedAt: new Date()
                });
                
                profile.wallet.balance -= product.price;
                profile.wallet.lastTransactionAt = new Date();
                
                await Promise.all([
                  order.save({ session }),
                  transaction.save({ session }),
                  profile.save({ session })
                ]);
                
                orderPlaced = true;
                orderDetails = {
                  orderId: order.orderId,
                  productName: product.name,
                  amount: product.price,
                  estimatedDelivery: order.estimatedDelivery,
                  newWalletBalance: profile.wallet.balance,
                  partner: product.partner
                };
                
                taskAnalysis.title = `Order placed: ${product.name}`;
                taskAnalysis.description = `Successfully ordered ${product.name} for ₹${product.price} via ${product.partner}`;
                
                console.log('✅ Order placed successfully:', order.orderId);
                
              } else {
                console.log('❌ Insufficient balance');
                taskAnalysis.title = `Insufficient balance for ${product.name}`;
                taskAnalysis.description = `Wanted to order ${product.name} (₹${product.price}) but only has ₹${profile.wallet.balance}`;
              }
              if (isUrgent || orderPlaced) {
  await notifyFamilyMembers(sender, message, isUrgent);
}

            });
          } finally {
            await session.endSession();
          }
        } else {
          console.log('❌ Product not found in catalog');
          taskAnalysis.title = 'Food order - item not found';
          taskAnalysis.description = `Requested food item not found in catalog: ${transcript}`;
        }
      }
    }

    // 5. Generate appropriate AI response
    let aiResponse = '';
    if (hasTask && taskAnalysis) {
      if (orderPlaced) {
        aiResponse = `Great! I've placed your order for ${orderDetails.productName} via ${orderDetails.partner}. It costs ₹${orderDetails.amount} and will be delivered in ${orderDetails.estimatedDelivery}. Your remaining balance is ₹${orderDetails.newWalletBalance}.`;
        console.log('✅ Generated order success response');
      } else if (taskAnalysis.taskType === 'food_order' && taskAnalysis.title.includes('Insufficient')) {
        aiResponse = `I understand you want to order food, but you don't have enough balance in your wallet. Your family has been notified to help you add money.`;
        console.log('✅ Generated insufficient balance response');
      } else if (taskAnalysis.taskType === 'food_order' && taskAnalysis.title.includes('not found')) {
        aiResponse = `I couldn't find that specific item in our menu. I've created a task for your family to help you order it manually.`;
        console.log('✅ Generated product not found response');
      } else {
        const taskConfirmationPrompt = `You are a helpful AI assistant speaking to an elderly person. You have just created a task called "${taskAnalysis.title}" and their family will help them.

Respond with exactly ONE short, warm, respectful message (1-2 sentences only). 

IMPORTANT: Mention that you have "created a task" or "set up a task" in your response.

Be caring but treat them with dignity. Do not use words like "dear" or sound condescending. Speak to them as you would to any adult.

Your response:`;

        aiResponse = await tracedChatTool(taskConfirmationPrompt);
        console.log('✅ Generated general task response');
      }
    } else {
      const responsePrompt = `Reply to this elderly person in exactly 1 short, friendly sentence: "${transcript}"`;
      aiResponse = await tracedChatTool(responsePrompt);
      console.log('✅ Generated conversational response');
    }

    console.log('🤖 AI Response generated:', aiResponse);

    // 6. Generate audio response using Sarvam TTS
    let audioUrl = null;
    try {
      console.log('🎵 Starting audio generation...');
      const audioBuffer = await textToSpeech(aiResponse);
      
      if (audioBuffer) {
        const fileName = `response_${Date.now()}.wav`;
        audioUrl = await storeAudioFile(audioBuffer, fileName, 'audio/wav');
        console.log('✅ Audio generated and uploaded:', audioUrl);
      } else {
        console.log('⚠️ No audio buffer received, skipping upload');
      }
    } catch (audioError) {
      console.error('❌ Audio generation failed:', audioError.message);
      console.error('❌ Audio error stack:', audioError.stack);
    }

    // 7. Get family member count for metadata
    let familyMemberCount = 0;
    try {
      const familyMembers = await User.find({ 
        role: 'family',
        'elderlyConnections.elderId': senderId,
        'elderlyConnections.status': 'active'
      });
      familyMemberCount = familyMembers.length;
    } catch (error) {
      console.log('❌ Error getting family member count:', error);
    }

    // 8. Save message
    console.log('🔍 Message creation debug:', {
      senderId: senderId,
      transcript: transcript,
      aiResponse: aiResponse,
      transcriptType: typeof transcript,
      aiResponseType: typeof aiResponse,
      transcriptLength: transcript?.length,
      aiResponseLength: aiResponse?.length
    });

    const message = new Message({
      senderId: senderId,
      transcript: transcript,
      aiResponse: aiResponse,
      audioUrl: audioUrl,
      urgencyFlag: isUrgent,
      familyMemberRoles: [],
      notificationsSent: isUrgent || orderPlaced,
      readBy: [],
      metadata: {
        urgency: isUrgent ? 'urgent' : 'not urgent',
        senderName: sender.name,
        familyMemberCount: familyMemberCount,
        processingTime: Date.now() - startTime,
        audioGenerated: !!audioUrl
      }
    });

    await message.save();
    console.log('✅ Message saved:', message._id);

    // 9. Create task if needed
    let taskCreated = false;
    let createdTask = null;
    
    if (hasTask && taskAnalysis && !orderPlaced) {
      try {
        const familyMembers = await User.find({ 
          role: 'family',
          'elderlyConnections.elderId': senderId,
          'elderlyConnections.status': 'active'
        });

        if (familyMembers.length > 0) {
          const newTask = new Task({
            title: taskAnalysis.title,
            description: taskAnalysis.description,
            type: taskAnalysis.taskType,
            priority: isUrgent ? 'urgent' : 'normal',
            status: 'pending',
            assignedTo: familyMembers.map(fm => fm._id),
            createdBy: senderId,
            elderlyUserId: senderId,
            voiceMessageId: message._id,
            originalTranscript: transcript,
            createdViaVoice: true
          });

          createdTask = await newTask.save();
          taskCreated = true;
          console.log('✅ Task created:', createdTask._id);
        }
      } catch (taskError) {
        console.error('❌ Error creating task:', taskError);
      }
    }

    // 10. Send notifications if urgent or order placed
    if (isUrgent || orderPlaced) {
      try {
        const familyMembers = await User.find({ 
          role: 'family',
          'elderlyConnections.elderId': senderId,
          'elderlyConnections.status': 'active'
        });

        const notificationPromises = familyMembers.map(async (familyMember) => {
          const notification = new Notification({
            userId: familyMember._id,
            title: orderPlaced ? 'Order Placed' : 'Urgent Message',
            message: orderPlaced ? 
              `${sender.name} ordered ${orderDetails.productName} for ₹${orderDetails.amount}` :
              `Urgent message from ${sender.name}: ${transcript}`,
            type: orderPlaced ? 'order' : 'urgent',
            relatedUser: senderId,
            messageId: message._id,
            taskId: createdTask?._id || null,
            orderDetails: orderDetails
          });
          
          return notification.save();
        });

        await Promise.all(notificationPromises);
        if (isUrgent || orderPlaced) {
  await notifyFamilyMembers(sender, message, isUrgent);
}
        console.log('✅ Family notifications sent');
      } catch (notificationError) {
        console.error('❌ Error sending notifications:', notificationError);
      }
    }

    const finalProcessingTime = Date.now() - startTime;
    console.log(`✅ Message processing completed in ${finalProcessingTime}ms`);

    return {
      messageId: message._id,
      aiResponse,
      audioUrl,
      urgency: isUrgent,
      transcript,
      familyNotified: isUrgent || orderPlaced,
      taskCreated,
      taskId: createdTask ? createdTask._id : null,
      orderPlaced,
      orderDetails,
      processingTime: finalProcessingTime
    };

  } catch (error) {
    console.error('❌ Error processing message:', error.message);
    return {
      success: false,
      error: 'Message processing failed',
      details: error.message
    };
  }
};


// ✅ Product matching function
const matchProductInDb = async (transcript) => {
  try {
    const { allItems } = require('../data/dummyData');
    
    if (!allItems || !Array.isArray(allItems)) {
      console.error('❌ allItems not found or not an array');
      return null;
    }
    
    const normalizedTranscript = transcript.toLowerCase().trim();
    console.log('🔍 Searching for products in transcript:', normalizedTranscript);
    console.log('🔍 Total products in database:', allItems.length);
    
    // Log first few products to verify structure
    console.log('🔍 Sample products:', allItems.slice(0, 2).map(item => ({
      id: item.id,
      name: item.name,
      partner: item.partner,
      idType: typeof item.id
    })));
    
    const matches = allItems.filter(item => {
      const itemName = item.name.toLowerCase();
      
      if (normalizedTranscript.includes(itemName)) {
        console.log('✅ Direct match found:', item.name, 'ID:', item.id, 'Type:', typeof item.id);
        return true;
      }
      
      const transcriptWords = normalizedTranscript.split(' ');
      const nameWords = itemName.split(' ');
      
      const matchCount = nameWords.filter(nameWord => 
        transcriptWords.some(transcriptWord => 
          transcriptWord.includes(nameWord) || nameWord.includes(transcriptWord)
        )
      ).length;
      
      if (matchCount >= Math.ceil(nameWords.length / 2)) {
        console.log('✅ Partial match found:', item.name, 'Match count:', matchCount);
        return true;
      }
      
      return false;
    });
    
    if (matches.length > 0) {
      const bestMatch = matches[0];
      console.log('🎯 Best match selected:', {
        id: bestMatch.id,
        idType: typeof bestMatch.id,
        name: bestMatch.name,
        price: bestMatch.price,
        partner: bestMatch.partner
      });
      return bestMatch;
    }
    
    console.log('❌ No product match found');
    return null;
    
  } catch (error) {
    console.error('💥 Error in matchProductInDb:', error);
    return null;
  }
};


// // ✅ ADD: Product matching function
// const matchProductInDb = async (transcript) => {
//   try {
//     const { allItems } = require('../data/dummyData');
    
//     const normalizedTranscript = transcript.toLowerCase().trim();
//     console.log('🔍 Searching for products in transcript:', normalizedTranscript);
    
//     const matches = allItems.filter(item => {
//       const itemName = item.name.toLowerCase();
      
//       if (normalizedTranscript.includes(itemName)) {
//         console.log('✅ Direct match found:', item.name);
//         return true;
//       }
      
//       const transcriptWords = normalizedTranscript.split(' ');
//       const nameWords = itemName.split(' ');
      
//       const matchCount = nameWords.filter(nameWord => 
//         transcriptWords.some(transcriptWord => 
//           transcriptWord.includes(nameWord) || nameWord.includes(transcriptWord)
//         )
//       ).length;
      
//       if (matchCount >= Math.ceil(nameWords.length / 2)) {
//         console.log('✅ Partial match found:', item.name, 'Match count:', matchCount);
//         return true;
//       }
      
//       return false;
//     });
    
//     if (matches.length > 0) {
//       const bestMatch = matches[0];
//       console.log('🎯 Best match selected:', bestMatch.name, 'Price:', bestMatch.price);
//       return bestMatch;
//     }
    
//     console.log('❌ No product match found');
//     return null;
    
//   } catch (error) {
//     console.error('💥 Error in matchProductInDb:', error);
//     return null;
//   }
// };



// ✅ ADD: Product matching function



// ✅ Product matching function (same as before)






const notifyGroupMembers = async (groupId, task, sender) => {
  try {
    const group = await Group.findById(groupId).populate('members.userId', 'name');

    if (!group) {
      console.log('Group not found for notification');
      return;
    }

    const notificationTitle = `🔔 New Task: ${task.title}`;
    const notificationBody = `${sender.name} needs help: ${task.description}`;

    // ✅ Hardcoded Expo push token
    const hardcodedExpoToken = 'ExponentPushToken[8ROVvqN01l50SXXAWdq5Ty]'; // Replace with a real one

    const payload = {
      to: hardcodedExpoToken,
      sound: 'default',
      title: notificationTitle,
      body: notificationBody,
      data: {
        taskId: task._id.toString(),
        groupId: groupId.toString(),
        senderId: sender._id.toString(),
        taskType: task.taskType || '',
        priority: task.priority || '',
      },
    };

    try {
      const response = await axios.post('https://exp.host/--/api/v2/push/send', payload, {
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
      });

      console.log(`✅ Expo push sent:`, response.data);
    } catch (error) {
      console.error(`❌ Expo push failed:`, error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Error in notifyGroupMembers:', error);
  }
};

// const notifyGroupMembers = async (groupId, task, sender) => {
//   try {
//     const group = await Group.findById(groupId).populate('members.userId', 'name');

//     if (!group) {
//       console.log('Group not found for notification');
//       return;
//     }

//     const notificationTitle = `🔔 New Task: ${task.title}`;
//     const notificationBody = `${sender.name} needs help: ${task.description}`;

//     // ✅ Hardcoded FCM token
//     const hardcodedFcmToken = 'ExponentPushToken[8ROVvqN01l50SXXAWdq5Ty]'; // ← Replace with actual token

//     const message = {
//       token: hardcodedFcmToken,
//       notification: {
//         title: notificationTitle,
//         body: notificationBody,
//       },
//       data: {
//         taskId: task._id.toString(),
//         groupId: groupId.toString(),
//         senderId: sender._id.toString(),
//         taskType: task.taskType || '',
//         priority: task.priority || '',
//       },
//     };

//     try {
//       const response = await admin.messaging().send(message);
//       console.log(`✅ Notification sent:`, response);
//     } catch (error) {
//       console.error(`❌ Error sending notification:`, error.message);
//     }

//   } catch (error) {
//     console.error('Error in notifyGroupMembers:', error);
//   }
// };

// const notifyFamilyMembers = async (sender, message, isUrgent) => {
//   try {
//     console.log(`📱 ${isUrgent ? 'URGENT' : 'Regular'} notification for message ${message._id}`);
//     console.log(`From: ${sender.name}`);
//     console.log(`Message: ${message.transcript.substring(0, 100)}...`);
    
//     const notificationLog = {
//       messageId: message._id,
//       senderId: sender._id,
//       urgency: isUrgent,
//       timestamp: new Date(),
//       recipients: [],
//       status: 'sent'
//     };
    
//     console.log('Notification logged:', notificationLog);

//   } catch (error) {
//     console.error('Error notifying family members:', error);
//   }
// };


const notifyFamilyMembers = async (sender, message, isUrgent) => {
  try {
    console.log('🔔 Starting family notification...');
    console.log(`📨 Message ID: ${message._id}`);
    console.log(`👤 Sender: ${sender.name} (${sender._id})`);
    console.log(`📝 Transcript: ${message.transcript.substring(0, 100)}...`);
    console.log(`⚠️ Urgency: ${isUrgent ? 'URGENT' : 'Not Urgent'}`);

    const notificationLog = {
      messageId: message._id,
      senderId: sender._id,
      urgency: isUrgent,
      timestamp: new Date(),
      recipients: [],
      status: 'sent'
    };

    // ✅ Hardcoded Expo push token
    const hardcodedExpoToken = 'ExponentPushToken[8ROVvqN01l50SXXAWdq5Ty]'; // Replace with real token
    console.log('📱 Using hardcoded Expo push token:', hardcodedExpoToken);

    const notificationTitle = isUrgent ? '🚨 Urgent Help Needed!' : '📢 New Message Alert';
    const notificationBody = `${sender.name}: ${message.transcript.substring(0, 60)}...`;

    console.log('🧾 Notification title:', notificationTitle);
    console.log('🧾 Notification body:', notificationBody);

    const payload = {
      to: hardcodedExpoToken,
      sound: 'default',
      title: notificationTitle,
      body: notificationBody,
      data: {
        messageId: message._id.toString(),
        senderId: sender._id.toString(),
        isUrgent: isUrgent.toString()
      },
    };

    console.log('📦 Payload to send:', JSON.stringify(payload, null, 2));

    // Send push via Expo
    const response = await axios.post('https://exp.host/--/api/v2/push/send', payload, {
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Expo Push Notification Response:', JSON.stringify(response.data, null, 2));
    console.log('🗃️ Notification log entry:', notificationLog);
    console.log('✅ Notification flow completed');

  } catch (error) {
    console.error('❌ Error notifying family members:');
    if (error.response?.data) {
      console.error('📛 Error response data:', error.response.data);
    } else {
      console.error('📛 Error message:', error.message);
    }
  }
};

// Get agent history
const getAgentHistory = async (req, res) => {
  try {
    const { userId } = req.user;
    const history = await Agent.getUserHistory(userId, 20);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get urgent messages
const getUrgentMessages = async (req, res) => {
  try {
    const urgentMessages = await Message.getUrgentMessages(10);
    
    res.json({
      success: true,
      data: urgentMessages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get user messages
const getUserMessages = async (req, res) => {
  try {
    const { userId } = req.user;
    const messages = await Message.getMessagesByFamily(userId, 20);
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  processMessage,
  getAgentHistory,
  getUrgentMessages,
  getUserMessages,
  matchProductInDb,
};
