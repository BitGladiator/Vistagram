const amqp = require('amqplib');
const { query } = require('./database');
require('dotenv').config();

let connection = null;
let channel = null;

const connect = async () => {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

        // Listen to social events exchange
        await channel.assertExchange('social_events', 'topic', { durable: true });

        // Create a queue for post service
        const q = await channel.assertQueue('post_service_queue', { durable: true });

        // Bind to relevant events
        await channel.bindQueue(q.queue, 'social_events', 'social.post_liked');
        await channel.bindQueue(q.queue, 'social_events', 'social.post_unliked');

        console.log('Connected to RabbitMQ');
        console.log('Listening for social events in post-service...');

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

const handlePostLiked = async ({ post_id }) => {
    try {
        const result = await query(
            `UPDATE posts SET like_count = like_count + 1 WHERE post_id = $1 RETURNING post_id`,
            [post_id]
        );
        if (result.rowCount > 0) {
            console.log(`Incremented like_count for post: ${post_id}`);
        } else {
            console.log(`Post ${post_id} not found to increment like_count`);
        }
    } catch (error) {
        console.error('Error in handlePostLiked:', error);
        throw error;
    }
};

const handlePostUnliked = async ({ post_id }) => {
    try {
        const result = await query(
            `UPDATE posts SET like_count = GREATEST(0, like_count - 1) WHERE post_id = $1 RETURNING post_id`,
            [post_id]
        );
        if (result.rowCount > 0) {
            console.log(`Decremented like_count for post: ${post_id}`);
        } else {
            console.log(`Post ${post_id} not found to decrement like_count`);
        }
    } catch (error) {
        console.error('Error in handlePostUnliked:', error);
        throw error;
    }
};

module.exports = { connect };
