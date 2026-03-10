const amqp = require('amqplib');
const { query } = require('./database');
require('dotenv').config();

let connection = null;
let channel = null;

const connect = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await connection.createChannel();

    // Ensure exchange exists
    await channel.assertExchange('social_events', 'topic', { durable: true });

    // Ensure queue exists
    const q = await channel.assertQueue('user_service_social_events', { durable: true });

    // Bind queue to the exchange
    await channel.bindQueue(q.queue, 'social_events', 'social.user_followed');
    await channel.bindQueue(q.queue, 'social_events', 'social.user_unfollowed');

    console.log('Connected to RabbitMQ for social_events');

    // Consume messages
    channel.consume(q.queue, async (msg) => {
      if (msg !== null) {
        try {
          const event = JSON.parse(msg.content.toString());
          const routingKey = msg.fields.routingKey;

          if (routingKey === 'social.user_followed') {
            await handleUserFollowed(event.data);
          } else if (routingKey === 'social.user_unfollowed') {
            await handleUserUnfollowed(event.data);
          }

          channel.ack(msg);
        } catch (err) {
          console.error('Error processing event:', err);
          // Reject taking care not to requeue continuously infinite loops (better dead letter)
          channel.reject(msg, false);
        }
      }
    });

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

const handleUserFollowed = async (data) => {
  const { follower_id, followee_id } = data;
  try {
    // Increment following for follower
    await query(
      `UPDATE users SET following_count = following_count + 1 WHERE user_id = $1`,
      [follower_id]
    );

    // Increment follower for followee
    await query(
      `UPDATE users SET follower_count = follower_count + 1 WHERE user_id = $1`,
      [followee_id]
    );
    console.log(`Incremented follows for follower ${follower_id} and followee ${followee_id}`);
  } catch (error) {
    console.error('Error handling user_followed event in user-service:', error);
    throw error;
  }
};

const handleUserUnfollowed = async (data) => {
  const { follower_id, followee_id } = data;
  try {
    // Decrement following for follower
    await query(
      `UPDATE users SET following_count = GREATEST(0, following_count - 1) WHERE user_id = $1`,
      [follower_id]
    );

    // Decrement follower for followee
    await query(
      `UPDATE users SET follower_count = GREATEST(0, follower_count - 1) WHERE user_id = $1`,
      [followee_id]
    );
    console.log(`Decremented follows for follower ${follower_id} and followee ${followee_id}`);
  } catch (error) {
    console.error('Error handling user_unfollowed event in user-service:', error);
    throw error;
  }
};

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
  close
};
