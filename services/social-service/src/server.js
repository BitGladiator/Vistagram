const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const followRoutes = require('./routes/followRoutes');
const likeRoutes = require('./routes/likeRoutes');
const commentRoutes = require('./routes/commentRoutes');
const errorHandler = require('./middleware/errorHandler');
const { connect: connectRabbitMQ, close: closeRabbitMQ } = require('./config/rabbitmq');

const app = express();
const PORT = process.env.PORT || 3003;

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
    service: 'social-service',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/v1/follows', followRoutes);
app.use('/api/v1/likes', likeRoutes);
app.use('/api/v1/comments', commentRoutes);

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

// Error handler (must be last)
app.use(errorHandler);

// Connect to RabbitMQ
connectRabbitMQ();

// Start server
const server = app.listen(PORT, () => {
  console.log(`
Social Service running on port ${PORT}
Environment: ${process.env.NODE_ENV}
Health check: http://localhost:${PORT}/health
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await closeRabbitMQ();
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await closeRabbitMQ();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});