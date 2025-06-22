const { WebSocketServer } = require('ws');
const { geminiSessionHandler } = require('../controllers/geminiController');

function createWebSocketServer(server) {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws/gemini'
  });

  wss.on('connection', (ws, req) => {
    console.log('🔗 [WEBSOCKET] New enhanced client connected');
    console.log('📍 [WEBSOCKET] Client IP:', req.socket.remoteAddress);
    
    // Set up connection monitoring
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });
    
    geminiSessionHandler(ws);
  });

  // Health monitoring
  const wsHealthCheck = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        console.log('💀 [WEBSOCKET] Terminating dead connection');
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(wsHealthCheck);
  });

  return {
    wss,
    getStats: () => ({
      clients: wss.clients.size
    })
  };
}

module.exports = createWebSocketServer;
