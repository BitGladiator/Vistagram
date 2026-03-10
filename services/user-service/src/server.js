const app = require('./app');
const rabbitmq = require('./config/rabbitmq');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

// Start server
const server = app.listen(PORT, async () => {
  try {
    await rabbitmq.connect();
    console.log('User Service RabbitMQ connected');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ during startup', error);
  }
  console.log(`
User Service running on port ${PORT}
Environment: ${process.env.NODE_ENV}
Health check: http://localhost:${PORT}/health
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await rabbitmq.close();
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await rabbitmq.close();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;
