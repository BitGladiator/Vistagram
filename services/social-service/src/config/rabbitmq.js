const amqp = require('amqplib');
require('dotenv').config();

let connection = null;
let channel = null;

// Connect to RabbitMQ
const connect = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    // Declare exchanges
    await channel.assertExchange('social_events', 'topic', { durable: true });

    console.log('Connected to RabbitMQ');

    // Handle connection errors
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
    });

    connection.on('close', () => {
      console.log('RabbitMQ connection closed');
      // Reconnect after 5 seconds
      setTimeout(connect, 5000);
    });

  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error.message);
    // Retry connection after 5 seconds
    setTimeout(connect, 5000);
  }
};

// Publish an event
const publishEvent = async (eventType, data) => {
  try {
    if (!channel) {
      console.error('RabbitMQ channel not available');
      return false;
    }

    const event = {
      event_type: eventType,
      data: data,
      timestamp: new Date().toISOString()
    };

    const routingKey = `social.${eventType}`;

    channel.publish(
      'social_events',
      routingKey,
      Buffer.from(JSON.stringify(event)),
      { persistent: true }
    );

    console.log(`Published event: ${eventType}`, data);
    return true;
  } catch (error) {
    console.error('Error publishing event:', error);
    return false;
  }
};

// Close connection
const close = async () => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log('RabbitMQ connection closed');
  } catch (error) {
    console.error('Error closing RabbitMQ connection:', error);
  }
};

module.exports = {
  connect,
  publishEvent,
  close
};