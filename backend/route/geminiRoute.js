// // // const express = require('express');
// // // const router = express.Router();

// // // // Get WebSocket connection info
// // // router.get('/connection-info', (req, res) => {
// // //     res.json({
// // //         websocket_url: `ws://localhost:${process.env.PORT || 3000}/ws/gemini`,
// // //         status: 'available',
// // //         supported_formats: ['audio/pcm', 'image/jpeg'],
// // //         response_modalities: ['TEXT', 'AUDIO'],
// // //         model: 'gemini-2.0-flash-exp'
// // //     });
// // // });

// // // // Test endpoint for Gemini configuration
// // // router.post('/test-config', (req, res) => {
// // //     const { responseModalities, systemInstruction } = req.body;
    
// // //     res.json({
// // //         success: true,
// // //         config: {
// // //             responseModalities: responseModalities || ['TEXT', 'AUDIO'],
// // //             systemInstruction: systemInstruction || 'Default system instruction for screen sharing assistant',
// // //             model: 'gemini-2.0-flash-exp'
// // //         },
// // //         timestamp: new Date().toISOString()
// // //     });
// // // });

// // // // Health check for Gemini service
// // // router.get('/health', (req, res) => {
// // //     res.json({
// // //         service: 'gemini',
// // //         status: process.env.GOOGLE_API_KEY ? 'configured' : 'missing_api_key',
// // //         websocket_endpoint: '/ws/gemini',
// // //         api_version: 'v1alpha',
// // //         timestamp: new Date().toISOString()
// // //     });
// // // });

// // // // Get current WebSocket connections count
// // // router.get('/connections', (req, res) => {
// // //     // This would need to be passed from your main server file
// // //     // For now, we'll return a placeholder
// // //     res.json({
// // //         active_connections: 0, // You'll need to implement connection tracking
// // //         endpoint: '/ws/gemini',
// // //         status: 'active'
// // //     });
// // // });

// // // // Validate API key endpoint
// // // router.get('/validate-key', (req, res) => {
// // //     const hasApiKey = !!process.env.GOOGLE_API_KEY;
    
// // //     res.json({
// // //         valid: hasApiKey,
// // //         configured: hasApiKey,
// // //         message: hasApiKey ? 'API key is configured' : 'Google API key is missing from environment variables'
// // //     });
// // // });

// // // // Get supported media formats
// // // router.get('/formats', (req, res) => {
// // //     res.json({
// // //         supported_input_formats: [
// // //             {
// // //                 type: 'audio',
// // //                 mime_type: 'audio/pcm',
// // //                 description: 'PCM audio format for real-time processing'
// // //             },
// // //             {
// // //                 type: 'image',
// // //                 mime_type: 'image/jpeg',
// // //                 description: 'JPEG images for screen sharing analysis'
// // //             }
// // //         ],
// // //         supported_output_formats: [
// // //             {
// // //                 type: 'text',
// // //                 description: 'Text responses from Gemini'
// // //             },
// // //             {
// // //                 type: 'audio',
// // //                 mime_type: 'audio/wav',
// // //                 description: 'Audio responses from Gemini'
// // //             }
// // //         ]
// // //     });
// // // });

// // // module.exports = router;



// // // const express = require('express');
// // // const router = express.Router();

// // // router.get('/connection-info', (req, res) => {
// // //     res.json({
// // //         websocket_url: `ws://localhost:${process.env.PORT || 3000}/ws/gemini`,
// // //         status: 'available',
// // //         supported_formats: ['audio/pcm', 'image/jpeg'],
// // //         response_modalities: ['TEXT', 'AUDIO']
// // //     });
// // // });

// // // router.post('/test-config', (req, res) => {
// // //     const { responseModalities, systemInstruction } = req.body;
    
// // //     res.json({
// // //         success: true,
// // //         config: {
// // //             responseModalities: responseModalities || ['TEXT', 'AUDIO'],
// // //             systemInstruction: systemInstruction || 'Default system instruction',
// // //             model: 'gemini-2.0-flash-exp'
// // //         }
// // //     });
// // // });

// // // router.get('/health', (req, res) => {
// // //     res.json({
// // //         service: 'gemini',
// // //         status: process.env.GOOGLE_API_KEY ? 'configured' : 'missing_api_key',
// // //         timestamp: new Date().toISOString()
// // //     });
// // // });

// // // module.exports = router;



// // const express = require('express');
// // const router = express.Router();

// // router.get('/connection-info', (req, res) => {
// //     console.log('📡 [CONNECTION-INFO] Request received from:', req.ip);
// //     console.log('📡 [CONNECTION-INFO] Headers:', req.headers);
    
// //     const port = process.env.PORT || 3000;
// //     console.log('📡 [CONNECTION-INFO] Using port:', port);
    
// //     const response = {
// //         websocket_url: `ws://localhost:${port}/ws/gemini`,
// //         status: 'available',
// //         supported_formats: ['audio/pcm', 'image/jpeg'],
// //         response_modalities: ['TEXT', 'AUDIO']
// //     };
    
// //     console.log('📡 [CONNECTION-INFO] Sending response:', response);
// //     res.json(response);
// // });

// // router.post('/test-config', (req, res) => {
// //     console.log('⚙️ [TEST-CONFIG] Request received from:', req.ip);
// //     console.log('⚙️ [TEST-CONFIG] Request body:', req.body);
    
// //     const { responseModalities, systemInstruction } = req.body;
    
// //     console.log('⚙️ [TEST-CONFIG] Extracted responseModalities:', responseModalities);
// //     console.log('⚙️ [TEST-CONFIG] Extracted systemInstruction:', systemInstruction);
    
// //     const response = {
// //         success: true,
// //         config: {
// //             responseModalities: responseModalities || ['TEXT', 'AUDIO'],
// //             systemInstruction: systemInstruction || 'Default system instruction',
// //             model: 'gemini-2.0-flash-exp'
// //         }
// //     };
    
// //     console.log('⚙️ [TEST-CONFIG] Sending response:', response);
// //     res.json(response);
// // });

// // router.get('/health', (req, res) => {
// //     console.log('🏥 [HEALTH] Health check request received from:', req.ip);
// //     console.log('🏥 [HEALTH] Request headers:', req.headers);
    
// //     const hasApiKey = !!process.env.GOOGLE_API_KEY;
// //     console.log('🏥 [HEALTH] GOOGLE_API_KEY present:', hasApiKey);
    
// //     if (!hasApiKey) {
// //         console.warn('🏥 [HEALTH] ⚠️ WARNING: GOOGLE_API_KEY is missing!');
// //     } else {
// //         console.log('🏥 [HEALTH] ✅ GOOGLE_API_KEY is configured');
// //     }
    
// //     const response = {
// //         service: 'gemini',
// //         status: hasApiKey ? 'configured' : 'missing_api_key',
// //         timestamp: new Date().toISOString()
// //     };
    
// //     console.log('🏥 [HEALTH] Sending response:', response);
// //     res.json(response);
// // });

// // // Add error handling middleware for debugging
// // router.use((error, req, res, next) => {
// //     console.error('❌ [GEMINI-ROUTE-ERROR] Error occurred:');
// //     console.error('❌ [GEMINI-ROUTE-ERROR] Message:', error.message);
// //     console.error('❌ [GEMINI-ROUTE-ERROR] Stack:', error.stack);
// //     console.error('❌ [GEMINI-ROUTE-ERROR] Request URL:', req.originalUrl);
// //     console.error('❌ [GEMINI-ROUTE-ERROR] Request Method:', req.method);
// //     console.error('❌ [GEMINI-ROUTE-ERROR] Request Body:', req.body);
    
// //     res.status(500).json({
// //         error: 'Internal server error',
// //         message: error.message,
// //         timestamp: new Date().toISOString()
// //     });
// // });

// // console.log('🚀 [GEMINI-ROUTES] Gemini routes module loaded successfully');

// // module.exports = router;





// const express = require('express');
// const router = express.Router();

// router.get('/connection-info', (req, res) => {
//     console.log('📡 [CONNECTION-INFO] Request received from:', req.ip);
//     console.log('📡 [CONNECTION-INFO] Headers:', req.headers);
    
//     const port = process.env.PORT || 3000;
//     console.log('📡 [CONNECTION-INFO] Using port:', port);
    
//     const response = {
//         websocket_url: `ws://localhost:${port}/ws/gemini`,
//         status: 'available',
//         supported_formats: ['audio/pcm', 'audio/m4a', 'image/jpeg'],
//         response_modalities: ['TEXT', 'AUDIO'],
//         model: 'gemini-2.0-flash-exp'
//     };
    
//     console.log('📡 [CONNECTION-INFO] Sending response:', response);
//     res.json(response);
// });

// router.post('/test-config', (req, res) => {
//     console.log('⚙️ [TEST-CONFIG] Request received from:', req.ip);
//     console.log('⚙️ [TEST-CONFIG] Request body:', req.body);
    
//     const { responseModalities, systemInstruction } = req.body;
    
//     console.log('⚙️ [TEST-CONFIG] Extracted responseModalities:', responseModalities);
//     console.log('⚙️ [TEST-CONFIG] Extracted systemInstruction:', systemInstruction);
    
//     const response = {
//         success: true,
//         config: {
//             responseModalities: responseModalities || ['TEXT', 'AUDIO'],
//             systemInstruction: systemInstruction || 'Default mobile app guidance system instruction',
//             model: 'gemini-2.0-flash-exp'
//         }
//     };
    
//     console.log('⚙️ [TEST-CONFIG] Sending response:', response);
//     res.json(response);
// });

// router.get('/health', (req, res) => {
//     console.log('🏥 [HEALTH] Health check request received from:', req.ip);
//     console.log('🏥 [HEALTH] Request headers:', req.headers);
    
//     const hasApiKey = !!process.env.GOOGLE_API_KEY;
//     console.log('🏥 [HEALTH] GOOGLE_API_KEY present:', hasApiKey);
    
//     if (!hasApiKey) {
//         console.warn('🏥 [HEALTH] ⚠️ WARNING: GOOGLE_API_KEY is missing!');
//     } else {
//         console.log('🏥 [HEALTH] ✅ GOOGLE_API_KEY is configured');
//     }
    
//     const response = {
//         service: 'gemini',
//         status: hasApiKey ? 'configured' : 'missing_api_key',
//         timestamp: new Date().toISOString(),
//         features: ['screen_sharing', 'audio_recording', 'app_guidance']
//     };
    
//     console.log('🏥 [HEALTH] Sending response:', response);
//     res.json(response);
// });

// // Add error handling middleware for debugging
// router.use((error, req, res, next) => {
//     console.error('❌ [GEMINI-ROUTE-ERROR] Error occurred:');
//     console.error('❌ [GEMINI-ROUTE-ERROR] Message:', error.message);
//     console.error('❌ [GEMINI-ROUTE-ERROR] Stack:', error.stack);
//     console.error('❌ [GEMINI-ROUTE-ERROR] Request URL:', req.originalUrl);
//     console.error('❌ [GEMINI-ROUTE-ERROR] Request Method:', req.method);
//     console.error('❌ [GEMINI-ROUTE-ERROR] Request Body:', req.body);
    
//     res.status(500).json({
//         error: 'Internal server error',
//         message: error.message,
//         timestamp: new Date().toISOString()
//     });
// });

// console.log('🚀 [GEMINI-ROUTES] Gemini routes module loaded successfully');

// module.exports = router;





const express = require('express');
const { GeminiController } = require('../controllers/geminiController');

const router = express.Router();

// GET /api/gemini/status - Get enhanced Gemini API status
router.get('/status', GeminiController.getStatus);

// POST /api/gemini/process-audio - Process audio data with enhanced AI
router.post('/process-audio', GeminiController.processAudio);

// POST /api/gemini/process-image - Process image data with intelligent analysis
router.post('/process-image', GeminiController.processImage);

// POST /api/gemini/start-session - Start enhanced Gemini session
router.post('/start-session', GeminiController.startSession);

// GET /api/gemini/health - Enhanced health check
router.get('/health', (req, res) => {
    res.status(200).json({
        service: 'Enhanced Gemini Live API',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        endpoints: {
            websocket: '/ws/gemini',
            rest_api: '/api/gemini'
        },
        features: ['intelligent_processing', 'real_time_guidance', 'multi_modal_ai']
    });
});

// GET /api/gemini/capabilities - Get AI capabilities
router.get('/capabilities', (req, res) => {
    res.status(200).json({
        capabilities: {
            audio_processing: {
                formats: ['m4a', 'pcm'],
                features: ['real_time_analysis', 'intelligent_responses']
            },
            image_processing: {
                formats: ['jpeg', 'png'],
                features: ['screen_analysis', 'ui_guidance']
            },
            communication: {
                protocols: ['websocket', 'rest_api'],
                features: ['bi_directional', 'real_time']
            }
        },
        version: '2.0.0'
    });
});

module.exports = router;
