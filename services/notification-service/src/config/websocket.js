const WebSocket = require('ws');

// Map of user_id -> WebSocket connection
const connections = new Map();

let wss = null;

// Initialize WebSocket server
const init = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');

    // Get user_id from query params
    const url = new URL(req.url, `http://localhost`);
    const user_id = url.searchParams.get('user_id');

    if (!user_id) {
      ws.close(1008, 'user_id required');
      return;
    }

    // Store connection
    connections.set(user_id, ws);
    console.log(`WebSocket connected for user: ${user_id}`);
    console.log(`Active connections: ${connections.size}`);

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to Vistagram notifications',
      timestamp: new Date().toISOString()
    }));

    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log(`Message from ${user_id}:`, data);

        // Handle ping/pong for keepalive
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      connections.delete(user_id);
      console.log(`WebSocket disconnected for user: ${user_id}`);
      console.log(`Active connections: ${connections.size}`);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for user ${user_id}:`, error);
      connections.delete(user_id);
    });
  });

  console.log('WebSocket server initialized');
  return wss;
};

// Send notification to specific user
const sendToUser = (user_id, notification) => {
  const ws = connections.get(user_id);

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(notification));
    console.log(`Sent notification to user: ${user_id}`);
    return true;
  }

  console.log(`User ${user_id} not connected via WebSocket`);
  return false;
};

// Get active connection count
const getConnectionCount = () => connections.size;

// Check if user is connected
const isConnected = (user_id) => {
  const ws = connections.get(user_id);
  return ws && ws.readyState === WebSocket.OPEN;
};

module.exports = {
  init,
  sendToUser,
  getConnectionCount,
  isConnected
};