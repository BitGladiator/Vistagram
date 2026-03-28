const shardRouter = require('./shardRouter');

const query = async (text, params, userId) => {
  const shard = shardRouter.getShardForUser(userId);
  const client = await shard.pool.connect();
  
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};


const scatterGatherQuery = async (text, params) => {
  const shards = shardRouter.getAllShards();
  const promises = shards.map(shard => 
    shard.pool.query(text, params)
  );
  
  const results = await Promise.all(promises);
  return {
    rows: results.flatMap(r => r.rows),
    rowCount: results.reduce((sum, r) => sum + r.rowCount, 0)
  };
};