const Redis = require('ioredis');

const cluster = new Redis.Cluster([
  { host: 'redis-node-1', port: 6379 },
  { host: 'redis-node-2', port: 6380 },
  { host: 'redis-node-3', port: 6381 },
  { host: 'redis-node-4', port: 6382 },
  { host: 'redis-node-5', port: 6383 },
  { host: 'redis-node-6', port: 6384 }
], {
  redisOptions: {
    password: process.env.REDIS_PASSWORD
  },
  clusterRetryStrategy: (times) => Math.min(100 * times, 2000)
});

module.exports = cluster;