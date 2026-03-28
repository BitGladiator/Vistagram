const crypto = require('crypto');

class DatabaseShardRouter {
  constructor(shardConfigs) {
    this.shards = shardConfigs; 
    this.totalShards = shardConfigs.length;
  }

 
  getShardForUser(userId) {
    const hash = crypto.createHash('md5').update(userId).digest('hex');
    const hashInt = parseInt(hash.substring(0, 8), 16);
    const shardIndex = hashInt % this.totalShards;
    return this.shards[shardIndex];
  }

 
  getShardForPost(userId, createdAt) {
    const userShard = this.getShardForUser(userId);
    return userShard; 
  }

 
  getAllShards() {
    return this.shards;
  }
}


const shardConfigs = [
  {
    id: 'shard-1',
    host: 'postgres-shard-1',
    port: 5432,
    database: 'vistagram_users_shard_1',
    user: 'vistagram',
    password: process.env.POSTGRES_PASSWORD,
    pool: { min: 2, max: 10 }
  },
  {
    id: 'shard-2',
    host: 'postgres-shard-2',
    port: 5432,
    database: 'vistagram_users_shard_2',
    user: 'vistagram',
    password: process.env.POSTGRES_PASSWORD,
    pool: { min: 2, max: 10 }
  },
  {
    id: 'shard-3',
    host: 'postgres-shard-3',
    port: 5432,
    database: 'vistagram_users_shard_3',
    user: 'vistagram',
    password: process.env.POSTGRES_PASSWORD,
    pool: { min: 2, max: 10 }
  }
];

module.exports = new DatabaseShardRouter(shardConfigs);