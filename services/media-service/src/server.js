const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const mediaRoutes = require('./routes/mediaRoutes');
const errorHandler = require('./middleware/errorHandler');
const { initBucket } = require('./config/minio');
const { connect: connectRabbitMQ } = require('./config/rabbitmq');

const app = express();
const PORT = process.env.PORT || 3005;

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
    service: 'media-service',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/v1/media', mediaRoutes);

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
  try {
    // Initialize MinIO bucket
    await initBucket();

    // Connect to RabbitMQ
    await connectRabbitMQ();

    app.listen(PORT, () => {
      console.log(`
Media Service running on port ${PORT}
Environment: ${process.env.NODE_ENV}
Health check: http://localhost:${PORT}/health
MinIO bucket: ${process.env.MINIO_BUCKET_NAME}
      `);
    });
  } catch (error) {
    console.error('Failed to start Media Service:', error);
    process.exit(1);
  }
};

startServer();