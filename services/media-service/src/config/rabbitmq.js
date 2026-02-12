const amqp = require('amqplib');
require('dotenv').config();

let connection = null;
let channel = null;

const connect = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange('media_events', 'topic', { durable: true });

    console.log('Connected to RabbitMQ');

    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
    });

    connection.on('close', () => {
      console.log('RabbitMQ connection closed, reconnecting...');
      setTimeout(connect, 5000);
    });

  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error.message);
    setTimeout(connect, 5000);
  }
};

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

    channel.publish(
      'media_events',
      `media.${eventType}`,
      Buffer.from(JSON.stringify(event)),
      { persistent: true }
    );

    console.log(`📤 Published event: ${eventType}`);
    return true;
  } catch (error) {
    console.error('Error publishing event:', error);
    return false;
  }
};

module.exports = { connect, publishEvent };