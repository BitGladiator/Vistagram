const amqp = require('amqplib');
require('dotenv').config();

let connection = null;
let channel = null;

const connect = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    // Listen to both social and media events
    await channel.assertExchange('social_events', 'topic', { durable: true });
    await channel.assertExchange('media_events', 'topic', { durable: true });

    // Create queue for notification service
    const q = await channel.assertQueue(
      'notification_service_queue',
      { durable: true }
    );

    // Bind to relevant events from social service
    await channel.bindQueue(q.queue, 'social_events', 'social.user_followed');
    await channel.bindQueue(q.queue, 'social_events', 'social.post_liked');
    await channel.bindQueue(q.queue, 'social_events', 'social.post_commented');

    // Bind to media events
    await channel.bindQueue(q.queue, 'media_events', 'media.media_uploaded');

    console.log('Connected to RabbitMQ');
    console.log('Listening for events...');

    // Consume messages
    channel.consume(q.queue, handleMessage, { noAck: false });

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

// Handle incoming events
const handleMessage = async (msg) => {
  if (!msg) return;

  try {
    const event = JSON.parse(msg.content.toString());
    console.log(`📨 Received event: ${event.event_type}`);

    const notificationService = require('../services/notificationService');

    switch (event.event_type) {
      case 'user_followed':
        await notificationService.handleUserFollowed(event.data);
        break;
      case 'post_liked':
        await notificationService.handlePostLiked(event.data);
        break;
      case 'post_commented':
        await notificationService.handlePostCommented(event.data);
        break;
      case 'media_uploaded':
        await notificationService.handleMediaUploaded(event.data);
        break;
      default:
        console.log(`Unknown event: ${event.event_type}`);
    }

    channel.ack(msg);
  } catch (error) {
    console.error('Error handling message:', error);
    channel.nack(msg, false, true);
  }
};

module.exports = { connect };