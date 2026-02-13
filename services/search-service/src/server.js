const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const searchRoutes = require('./routes/searchRoutes');
const errorHandler = require('./middleware/errorHandler');
const redis = require('./config/redis');
const { connect: connectOpenSearch } = require('./config/opensearch');

const app = express();
const PORT = process.env.PORT || 3007;

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
    service: 'search-service',
    engine: 'opensearch',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/v1/search', searchRoutes);

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
  // Connect to Redis
  await redis.connect();

  // Connect to OpenSearch
  const osConnected = await connectOpenSearch();
  if (!osConnected) {
    console.error('Could not connect to OpenSearch. Make sure it is running!');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`
Search Service running on port ${PORT}
Environment: ${process.env.NODE_ENV}
Search Engine: OpenSearch
Health check: http://localhost:${PORT}/health
    `);
  });
};

startServer();