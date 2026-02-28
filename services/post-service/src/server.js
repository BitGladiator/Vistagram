const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const postRoutes = require('./routes/postRoutes');
const errorHandler = require('./middleware/errorHandler');
const rabbitmq = require('./config/rabbitmq');

const app = express();
const PORT = process.env.PORT || 3002;


app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    service: 'post-service',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/v1/posts', postRoutes);

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

// Start server
app.listen(PORT, async () => {
  console.log(`
Post Service running on port ${PORT}
Environment: ${process.env.NODE_ENV}
Health check: http://localhost:${PORT}/health
  `);

  // Connect to RabbitMQ
  await rabbitmq.connect();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});