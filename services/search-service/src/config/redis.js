const redis = require('redis');
require('dotenv').config();

let client = null;

const connect = async () => {
  try {
    client = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      }
    });

    client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    client.on('connect', () => {
      console.log('Connected to Redis');
    });

    await client.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error.message);
  }
};

const get = async (key) => {
  try {
    if (!client) return null;
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Redis GET error:', error);
    return null;
  }
};

const set = async (key, value, ttl = 300) => {
  try {
    if (!client) return false;
    await client.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Redis SET error:', error);
    return false;
  }
};

module.exports = { connect, get, set };