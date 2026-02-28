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
    await channel.bindQueue(q.queue, 'social_events', 'social.post_unliked');

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
      case 'post_unliked':
        await handlePostUnliked(event.data);
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
// Invalidate the post cache and the specific user's feed queues
const handlePostLiked = async ({ post_id, user_id }) => {
  const redis = require('./redis');

  // Create an array of keys to delete
  const keysToDelete = [
    `post:${post_id}`
  ];

  if (user_id) {
    keysToDelete.push(`feed:home:${user_id}`);
    keysToDelete.push(`feed:explore:${user_id}`);
    for (let page = 1; page <= 10; page++) {
      keysToDelete.push(`feed:user:${user_id}:${page}`);
    }
  }

  await Promise.all(keysToDelete.map(key => redis.del(key)));

  if (user_id) {
    console.log(`Invalidated post cache: ${post_id} and feeds for user: ${user_id}`);
  } else {
    console.log(`Invalidated post cache: ${post_id}`);
  }
};

// When post gets unliked:
// Invalidate the post cache and the specific user's feed queues
const handlePostUnliked = async ({ post_id, user_id }) => {
  const redis = require('./redis');

  // Create an array of keys to delete
  const keysToDelete = [
    `post:${post_id}`
  ];

  if (user_id) {
    keysToDelete.push(`feed:home:${user_id}`);
    keysToDelete.push(`feed:explore:${user_id}`);
    for (let page = 1; page <= 10; page++) {
      keysToDelete.push(`feed:user:${user_id}:${page}`);
    }
  }

  await Promise.all(keysToDelete.map(key => redis.del(key)));

  if (user_id) {
    console.log(`Invalidated post cache: ${post_id} and feeds for user: ${user_id} (unliked)`);
  } else {
    console.log(`Invalidated post cache: ${post_id}`);
  }
};

module.exports = { connect };