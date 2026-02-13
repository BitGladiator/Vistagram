const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const notificationRoutes = require('./routes/notificationRoutes');
const errorHandler = require('./middleware/errorHandler');
const websocket = require('./config/websocket');
const { connect: connectRabbitMQ } = require('./config/rabbitmq');

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    service: 'notification-service',
    active_connections: websocket.getConnectionCount(),
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/v1/notifications', notificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  // Create HTTP server (needed for WebSocket)
  const server = http.createServer(app);

  // Initialize WebSocket on same HTTP server
  websocket.init(server);

  // Connect to RabbitMQ
  await connectRabbitMQ();

  server.listen(PORT, () => {
    console.log(`
Notification Service running on port ${PORT}
Environment: ${process.env.NODE_ENV}
Health check: http://localhost:${PORT}/health
xWebSocket: ws://localhost:${PORT}
    `);
  });

  process.on('SIGTERM', () => {
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
};

startServer();