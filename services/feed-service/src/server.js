const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const feedRoutes = require('./routes/feedRoutes');
const errorHandler = require('./middleware/errorHandler');
const redis = require('./config/redis');
const { connect: connectRabbitMQ } = require('./config/rabbitmq');

const app = express();
const PORT = process.env.PORT || 3004;

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
    service: 'feed-service',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/v1/feed', feedRoutes);

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

// Connect to Redis and RabbitMQ
const startServer = async () => {
  await redis.connect();
  await connectRabbitMQ();

  const server = app.listen(PORT, () => {
    console.log(`
Feed Service running on port ${PORT}
Environment: ${process.env.NODE_ENV}
Health check: http://localhost:${PORT}/health
    `);
  });

  process.on('SIGTERM', () => {
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
};

startServer();