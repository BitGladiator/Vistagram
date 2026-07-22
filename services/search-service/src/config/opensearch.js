const { Client } = require('@opensearch-project/opensearch');
require('dotenv').config();

const client = new Client({
  node: process.env.OPENSEARCH_URL || 'http://localhost:9200',
  ssl: {
    rejectUnauthorized: false
  }
});

// Connect with exponential backoff retry
const connect = async ({ retries = 10, initialDelay = 3000, maxDelay = 30000 } = {}) => {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await client.info();
      console.log(`Connected to OpenSearch: ${info.body.version.number}`);
      return true;
    } catch (error) {
      console.error(`OpenSearch connection error (attempt ${attempt}/${retries}):`, error.message);
      if (attempt === retries) return false;
      console.log(`Retrying in ${delay / 1000}s...`);
      await new Promise(res => setTimeout(res, delay));
      delay = Math.min(delay * 1.5, maxDelay);
    }
  }
  return false;
};

// Index names
const INDEXES = {
  USERS: process.env.OPENSEARCH_INDEX_USERS || 'users',
  POSTS: process.env.OPENSEARCH_INDEX_POSTS || 'posts',
  HASHTAGS: process.env.OPENSEARCH_INDEX_HASHTAGS || 'hashtags'
};

// Index a document
const indexDocument = async (index, id, body) => {
  try {
    await client.index({ index, id, body, refresh: true });
    return true;
  } catch (error) {
    console.error(`Error indexing document in ${index}:`, error);
    return false;
  }
};

// Delete a document
const deleteDocument = async (index, id) => {
  try {
    await client.delete({ index, id });
    return true;
  } catch (error) {
    console.error(`Error deleting document from ${index}:`, error);
    return false;
  }
};

// Update a document
const updateDocument = async (index, id, body) => {
  try {
    await client.update({ index, id, body: { doc: body }, retry_on_conflict: 3 });
    return true;
  } catch (error) {
    console.error(`Error updating document in ${index}:`, error);
    return false;
  }
};

module.exports = {
  client,
  connect,
  INDEXES,
  indexDocument,
  deleteDocument,
  updateDocument
};