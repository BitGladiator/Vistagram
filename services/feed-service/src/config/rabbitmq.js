const amqp = require('amqplib');
require('dotenv').config();

let connection = null;
let channel = null;

const connect = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    // Listen to social events exchange
    await channel.assertExchange('social_events', 'topic', { durable: true });

    // Create a queue for feed service
    const q = await channel.assertQueue('feed_service_queue', { durable: true });

    // Bind to relevant events
    await channel.bindQueue(q.queue, 'social_events', 'social.user_followed');
    await channel.bindQueue(q.queue, 'social_events', 'social.user_unfollowed');
    await channel.bindQueue(q.queue, 'social_events', 'social.post_liked');

    console.log('Connected to RabbitMQ');
    console.log('Listening for social events...');

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

// Handle incoming messages
const handleMessage = async (msg) => {
  if (!msg) return;

  try {
    const event = JSON.parse(msg.content.toString());
    console.log(`Received event: ${event.event_type}`, event.data);

    // Handle different event types
    switch (event.event_type) {
      case 'user_followed':
        await handleUserFollowed(event.data);
        break;
      case 'user_unfollowed':
        await handleUserUnfollowed(event.data);
        break;
      case 'post_liked':
        await handlePostLiked(event.data);
        break;
      default:
        console.log(`Unknown event type: ${event.event_type}`);
    }

    // Acknowledge message
    channel.ack(msg);
  } catch (error) {
    console.error('Error handling message:', error);
    // Reject and requeue the message
    channel.nack(msg, false, true);
  }
};

// When user follows someone:
// Invalidate their feed cache so it gets regenerated
const handleUserFollowed = async ({ follower_id, followee_id }) => {
  const redis = require('./redis');
  await redis.del(`feed:home:${follower_id}`);
  console.log(`Invalidated feed cache for user: ${follower_id}`);
};

// When user unfollows someone:
// Invalidate their feed cache
const handleUserUnfollowed = async ({ follower_id, followee_id }) => {
  const redis = require('./redis');
  await redis.del(`feed:home:${follower_id}`);
  console.log(`Invalidated feed cache for user: ${follower_id}`);
};

// When post gets liked:
// Update engagement score in cache (simple version)
const handlePostLiked = async ({ post_id }) => {
  const redis = require('./redis');
  await redis.del(`post:${post_id}`);
  console.log(`Invalidated post cache: ${post_id}`);
};

module.exports = { connect };