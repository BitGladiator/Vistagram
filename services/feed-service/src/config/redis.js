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

// Get value from cache
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

// Set value in cache
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

// Delete value from cache
const del = async (key) => {
  try {
    if (!client) return false;
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Redis DEL error:', error);
    return false;
  }
};

// Delete multiple keys by pattern
const delPattern = async (pattern) => {
  try {
    if (!client) return false;
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      console.log(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
    }
    return true;
  } catch (error) {
    console.error('Redis DEL PATTERN error:', error);
    return false;
  }
};

// Check if key exists
const exists = async (key) => {
  try {
    if (!client) return false;
    const result = await client.exists(key);
    return result === 1;
  } catch (error) {
    console.error('Redis EXISTS error:', error);
    return false;
  }
};

module.exports = {
  connect,
  get,
  set,
  del,
  delPattern,
  exists
};