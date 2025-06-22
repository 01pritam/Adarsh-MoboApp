// // require('dotenv').config();
// // const express = require('express');
// // const connectDB = require('./utils/connectdb');
// // const userRoutes = require('./route/user.route');
// // const agentroutes = require('./route/agentRoute');
// // const grouproutes = require('./route/grouproute');
// // const { storeAudioFile } = require('./utils/supbase');
// // const app = express();
// // const PORT = process.env.PORT || 3000;
// // const path = require('path');
// // const fs = require('fs');
// // const taskroutes = require('./route/taskroute');
// // // Connect to MongoDB
// // connectDB(process.env.MONGODB_URI);

// // // Middleware
// // app.use(express.json());

// // // Routes
// // app.use('/api/users', userRoutes);
// // app.use('/api/agent', agentroutes);

// // app.use('/api/group', grouproutes); 
// // app.use('/api/task', taskroutes); 



// // // Health check endpoint
// // app.get('/health', (req, res) => {
// //   res.status(200).json({ 
// //     status: 'OK', 
// //     timestamp: new Date().toISOString(),
// //     port: PORT 
// //   });
// // });

// // app.get('/test-audio-upload', async (req, res) => {
// //   try {
// //     // __dirname is defined in CommonJS — log the current directory
// //     console.log('🛠️ Current Directory:', __dirname);

// //     const testAudioPath = path.join(__dirname, 'sample.mp3');
// //     console.log('🔍 Full Audio Path:', testAudioPath);

// //     // Check if file exists before uploading
// //     if (!fs.existsSync(testAudioPath)) {
// //       console.error('❌ sample.mp3 not found at:', testAudioPath);
// //       return res.status(400).json({ error: 'Audio file not found for upload.' });
// //     }

// //     const publicUrl = await storeAudioFile('test123', testAudioPath);
// //     console.log('🌐 Uploaded Audio URL:', publicUrl);

// //     res.json({ success: true, url: publicUrl });
// //   } catch (err) {
// //     console.error('🔥 Upload failed:', err.message);
// //     res.status(500).json({ success: false, error: err.message });
// //   }
// // });





// // app.listen(PORT, () => {
// //   console.log(`Server running on port ${PORT}`);
// // });

// // module.exports = app;




// // require('dotenv').config();
// // const express = require('express');
// // const cors = require('cors'); // ✅ Import CORS
// // const connectDB = require('./utils/connectdb');
// // const userRoutes = require('./route/user.route');
// // const agentroutes = require('./route/agentRoute');
// // const grouproutes = require('./route/grouproute');
// // const { storeAudioFile } = require('./utils/supbase');
// // const taskroutes = require('./route/taskroute');
// // const path = require('path');
// // const fs = require('fs');
// // const reminderRoutes = require('./route/reminderRoute');

// // const app = express();
// // const PORT = process.env.PORT || 3000;

// // // ✅ Enable CORS
// // // const cors = require('cors');

// // const allowedOrigins = [
// //   'http://localhost:8081',
// //   'http://localhost:8082',
// //   'http://localhost:8083',
// //   'https://yourfrontenddomain.com', // Replace with your actual deployed frontend URL
// // ];

// // app.use(cors({
// //   origin: function (origin, callback) {
// //     // Allow requests with no origin (like mobile apps or curl)
// //     if (!origin) return callback(null, true);
// //     if (allowedOrigins.includes(origin)) {
// //       return callback(null, true);
// //     } else {
// //       return callback(new Error('Not allowed by CORS'));
// //     }
// //   },
// //   methods: ['GET', 'POST', 'PUT', 'DELETE'],
// //   credentials: true
// // }));
// // // Connect to MongoDB
// // connectDB(process.env.MONGODB_URI);

// // // Middleware
// // app.use(express.json());

// // // Routes
// // app.use('/api/users', userRoutes);
// // app.use('/api/agent', agentroutes);
// // app.use('/api/group', grouproutes); 
// // app.use('/api/task', taskroutes); 
// // // Import reminder routes

// // // Use reminder routes
// // app.use('/api/reminders', reminderRoutes);
// // // Health check endpoint
// // app.get('/health', (req, res) => {
// //   res.status(200).json({ 
// //     status: 'OK', 
// //     timestamp: new Date().toISOString(),
// //     port: PORT 
// //   });
// // });

// // app.get('/test-audio-upload', async (req, res) => {
// //   try {
// //     console.log('🛠️ Current Directory:', __dirname);

// //     const testAudioPath = path.join(__dirname, 'sample.mp3');
// //     console.log('🔍 Full Audio Path:', testAudioPath);

// //     if (!fs.existsSync(testAudioPath)) {
// //       console.error('❌ sample.mp3 not found at:', testAudioPath);
// //       return res.status(400).json({ error: 'Audio file not found for upload.' });
// //     }

// //     const publicUrl = await storeAudioFile('test123', testAudioPath);
// //     console.log('🌐 Uploaded Audio URL:', publicUrl);

// //     res.json({ success: true, url: publicUrl });
// //   } catch (err) {
// //     console.error('🔥 Upload failed:', err.message);
// //     res.status(500).json({ success: false, error: err.message });
// //   }
// // });

// // // Start server
// // app.listen(PORT, () => {
// //   console.log(`Server running on port ${PORT}`);
// // });

// // module.exports = app;



// require('dotenv').config();
// const express = require('express');
// const http = require('http');
// const { WebSocketServer } = require('ws');
// const cors = require('cors');
// const connectDB = require('./utils/connectdb');
// const userRoutes = require('./route/user.route');
// const agentroutes = require('./route/agentRoute');
// const grouproutes = require('./route/grouproute');
// const { storeAudioFile } = require('./utils/supbase');
// const taskroutes = require('./route/taskroute');
// const reminderRoutes = require('./route/reminderRoute');
// const geminiRoutes = require('./route/geminiRoute');
// const { geminiSessionHandler } = require('./controllers/geminiController');
// const path = require('path');
// const fs = require('fs');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Create HTTP server for both Express and WebSocket
// const server = http.createServer(app);

// // Create WebSocket server
// const wss = new WebSocketServer({ 
//   server,
//   path: '/ws/gemini'
// });

// // CORS Configuration
// const allowedOrigins = [
//   'http://localhost:8081',
//   'http://localhost:8082',
//   'http://localhost:8083',
//   'exp://192.168.1.100:8081', // Add your Expo development server
//   'https://yourfrontenddomain.com',
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     } else {
//       return callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true
// }));

// // Connect to MongoDB
// connectDB(process.env.MONGODB_URI);

// // Middleware
// app.use(express.json({ limit: '50mb' })); // Support large base64 data

// // Existing Routes
// app.use('/api/users', userRoutes);
// app.use('/api/agent', agentroutes);
// app.use('/api/group', grouproutes); 
// app.use('/api/task', taskroutes); 
// app.use('/api/reminders', reminderRoutes);
// app.use('/api/gemini', geminiRoutes);

// // WebSocket Connection Handler
// wss.on('connection', (ws, req) => {
//   console.log('New WebSocket connection established');
//   geminiSessionHandler(ws);
// });

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'OK', 
//     timestamp: new Date().toISOString(),
//     port: PORT,
//     websocket: {
//       clients: wss.clients.size,
//       endpoint: '/ws/gemini'
//     }
//   });
// });

// // Existing test audio upload endpoint
// app.get('/test-audio-upload', async (req, res) => {
//   try {
//     console.log('🛠️ Current Directory:', __dirname);
//     const testAudioPath = path.join(__dirname, 'sample.mp3');
//     console.log('🔍 Full Audio Path:', testAudioPath);

//     if (!fs.existsSync(testAudioPath)) {
//       console.error('❌ sample.mp3 not found at:', testAudioPath);
//       return res.status(400).json({ error: 'Audio file not found for upload.' });
//     }

//     const publicUrl = await storeAudioFile('test123', testAudioPath);
//     console.log('🌐 Uploaded Audio URL:', publicUrl);
//     res.json({ success: true, url: publicUrl });
//   } catch (err) {
//     console.error('🔥 Upload failed:', err.message);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // Start server with WebSocket support
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   console.log(`WebSocket server available at ws://localhost:${PORT}/ws/gemini`);
// });

// // Graceful shutdown
// process.on('SIGINT', () => {
//   console.log('Shutting down server...');
//   wss.close(() => {
//     server.close(() => {
//       process.exit(0);
//     });
//   });
// });

// module.exports = app;





//very imp

// require('dotenv').config();
// const express = require('express');
// const http = require('http');
// const { WebSocketServer } = require('ws');
// const cors = require('cors');
// const connectDB = require('./utils/connectdb');

// // Import routes
// const userRoutes = require('./route/user.route');
// const agentroutes = require('./route/agentRoute');
// const grouproutes = require('./route/grouproute');
// const taskroutes = require('./route/taskroute');
// const reminderRoutes = require('./route/reminderRoute');
// const geminiRoutes = require('./route/geminiRoute');
// const locationRoutes = require('./route/locationRoute'); 
// const groupMessageRoutes= require('./route/groupmessageRoute');// Assuming you have a groupMessageRoutes file
// // Import controllers
// const { geminiSessionHandler } = require('./controllers/geminiController');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Create HTTP server for both Express and WebSocket
// const server = http.createServer(app);

// // Create enhanced WebSocket server
// const wss = new WebSocketServer({ 
//   server,
//   path: '/ws/gemini'
// });

// // Enhanced CORS Configuration
// const allowedOrigins = [
//   'http://localhost:8081',
//   'http://localhost:8082',
//   'http://localhost:8083',
//   'exp://192.168.1.32:8081',
//   'exp://localhost:8081',
//   'https://yourfrontenddomain.com',
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     } else {
//       console.log('CORS blocked origin:', origin);
//       return callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// // Connect to MongoDB
// connectDB(process.env.MONGODB_URI);

// // Enhanced middleware
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// // Route Registration
// app.use('/api/users', userRoutes);
// app.use('/api/agent', agentroutes);
// app.use('/api/group', grouproutes); 
// app.use('/api/task', taskroutes); 
// app.use('/api/reminders', reminderRoutes);
// app.use('/api/gemini', geminiRoutes);
// app.use('/api/location', locationRoutes); // Assuming you have a locationRoutes file
// app.use('/api/groupmsg', groupMessageRoutes);
// // Enhanced WebSocket Connection Handler
// wss.on('connection', (ws, req) => {
//   console.log('🔗 [WEBSOCKET] New enhanced client connected');
//   console.log('📍 [WEBSOCKET] Client IP:', req.socket.remoteAddress);
  
//   // Set up connection monitoring
//   ws.isAlive = true;
//   ws.on('pong', () => {
//     ws.isAlive = true;
//   });
  
//   geminiSessionHandler(ws);
// });

// // Enhanced WebSocket health monitoring
// const wsHealthCheck = setInterval(() => {
//   wss.clients.forEach((ws) => {
//     if (ws.isAlive === false) {
//       console.log('💀 [WEBSOCKET] Terminating dead connection');
//       return ws.terminate();
//     }
    
//     ws.isAlive = false;
//     ws.ping();
//   });
// }, 30000);

// wss.on('close', () => {
//   clearInterval(wsHealthCheck);
// });

// // Enhanced global health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'Enhanced Server OK', 
//     timestamp: new Date().toISOString(),
//     port: PORT,
//     websocket: {
//       clients: wss.clients.size,
//       endpoint: '/ws/gemini',
//       status: 'active'
//     },
//     services: {
//       mongodb: 'connected',
//       gemini_api: 'ready',
//       cors: 'configured'
//     }
//   });
// });

// // Enhanced error handling middleware
// app.use((error, req, res, next) => {
//   console.error('🚨 [SERVER] Unhandled error:', error);
//   res.status(500).json({
//     error: 'Internal server error',
//     timestamp: new Date().toISOString()
//   });
// });

// // Start enhanced server
// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`🚀 Enhanced server running on port ${PORT}`);
//   console.log(`🔗 WebSocket endpoint: ws://localhost:${PORT}/ws/gemini`);
//   console.log(`📡 REST API: http://localhost:${PORT}/api`);
//   console.log(`🌐 Health check: http://localhost:${PORT}/health`);
// });

// // Enhanced graceful shutdown
// process.on('SIGINT', () => {
//   console.log('🛑 Shutting down enhanced server...');
//   wss.close(() => {
//     server.close(() => {
//       console.log('✅ Enhanced server shutdown complete');
//       process.exit(0);
//     });
//   });
// });

// module.exports = app;


require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./utils/connectdb');

// Import socket handlers
const createSocketServer = require('./socket/socketHandler');
const createWebSocketServer = require('./socket/webscoketHandler');

// Import routes
const userRoutes = require('./route/user.route');
const agentroutes = require('./route/agentRoute');
const grouproutes = require('./route/grouproute');
const taskroutes = require('./route/taskroute');
const reminderRoutes = require('./route/reminderRoute');
const geminiRoutes = require('./route/geminiRoute');
const locationRoutes = require('./route/locationRoute'); 
const groupMessageRoutes = require('./route/groupmessageRoute');
const profileRoutes = require('./route/profileroute');
const walletRoutes = require('./route/walletRoute'); 
const transactionRoutes = require('./route/transactionRoute'); 
const moodRoutes = require('./route/moodRoute'); 
const sosRoute = require('./route/sosRoute.js');
// Assuming you have a moodRoute file
const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);
const startReminderCronJob = require('./cron/reminderNotificationJob');
startReminderCronJob();
// Enhanced CORS Configuration
const allowedOrigins = [
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8083',
  'exp://192.168.1.32:8081',
  'exp://localhost:8081',
  'https://yourfrontenddomain.com',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connect to MongoDB
connectDB(process.env.MONGODB_URI);

// Enhanced middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Route Registration
app.use('/api/sos', sosRoute);
app.use('/api/users', userRoutes);
app.use('/api/agent', agentroutes);
app.use('/api/group', grouproutes); 
app.use('/api/task', taskroutes); 
app.use('/api/reminders', reminderRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/groupmsg', groupMessageRoutes);
app.use('/profile', profileRoutes);
app.use('/wallet', walletRoutes);                   // ← This is where it's used
app.use('/transactions', transactionRoutes);
app.use('/mood', moodRoutes);

// ✅ Initialize Socket.IO and WebSocket servers
const socketServer = createSocketServer(server);
const webSocketServer = createWebSocketServer(server);

// ✅ Clean health check endpoint
app.get('/health', (req, res) => {
  const socketStats = socketServer.getStats();
  const wsStats = webSocketServer.getStats();
  
  res.status(200).json({ 
    status: 'Enhanced Server OK', 
    timestamp: new Date().toISOString(),
    port: PORT,
    websockets: {
      gemini: {
        clients: wsStats.clients,
        endpoint: '/ws/gemini',
        status: 'active'
      },
      socketio: {
        clients: socketStats.clients,
        endpoint: '/socket.io',
        status: 'active',
        activeUsers: socketStats.activeUsers,
        activeGroups: socketStats.activeGroups
      }
    },
    services: {
      mongodb: 'connected',
      gemini_api: 'ready',
      cors: 'configured'
    }
  });
});

// Enhanced error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 [SERVER] Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start enhanced server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Enhanced server running on port ${PORT}`);
  console.log(`🔗 WebSocket endpoint: ws://localhost:${PORT}/ws/gemini`);
  console.log(`🔌 Socket.IO endpoint: ws://localhost:${PORT}/socket.io`);
  console.log(`📡 REST API: http://localhost:${PORT}/api`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

// Enhanced graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down enhanced server...');
  
  // Close Socket.IO
  socketServer.io.close(() => {
    console.log('✅ Socket.IO closed');
    
    // Close WebSocket
    webSocketServer.wss.close(() => {
      console.log('✅ WebSocket closed');
      
      // Close HTTP server
      server.close(() => {
        console.log('✅ Enhanced server shutdown complete');
        process.exit(0);
      });
    });
  });
});

module.exports = app;

