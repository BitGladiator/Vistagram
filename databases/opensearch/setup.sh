#!/bin/bash

echo "Setting up OpenSearch indexes for Vistagram..."

OPENSEARCH_URL="http://localhost:9200"

# Wait for OpenSearch to be ready
echo "Waiting for OpenSearch..."
until curl -sf "$OPENSEARCH_URL/_cluster/health" > /dev/null; do
  sleep 5
  echo "Still waiting..."
done
echo "OpenSearch is ready!"

# Delete existing indexes (fresh start)
curl -X DELETE "$OPENSEARCH_URL/users" 2>/dev/null
curl -X DELETE "$OPENSEARCH_URL/posts" 2>/dev/null
curl -X DELETE "$OPENSEARCH_URL/hashtags" 2>/dev/null

# Create users index
echo "Creating users index..."
curl -X PUT "$OPENSEARCH_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "analysis": {
        "analyzer": {
          "username_analyzer": {
            "type": "custom",
            "tokenizer": "keyword",
            "filter": ["lowercase"]
          }
        }
      }
    },
    "mappings": {
      "properties": {
        "user_id": { "type": "keyword" },
        "username": {
          "type": "text",
          "analyzer": "standard",
          "fields": {
            "keyword": { "type": "keyword" },
            "autocomplete": {
              "type": "search_as_you_type"
            }
          }
        },
        "full_name": {
          "type": "text",
          "analyzer": "standard",
          "fields": {
            "keyword": { "type": "keyword" }
          }
        },
        "bio": { "type": "text" },
        "profile_picture_url": { "type": "keyword", "index": false },
        "is_verified": { "type": "boolean" },
        "is_private": { "type": "boolean" },
        "follower_count": { "type": "integer" },
        "post_count": { "type": "integer" },
        "created_at": { "type": "date" }
      }
    }
  }'

echo ""

# Create posts index
echo "Creating posts index..."
curl -X PUT "$OPENSEARCH_URL/posts" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0
    },
    "mappings": {
      "properties": {
        "post_id": { "type": "keyword" },
        "user_id": { "type": "keyword" },
        "caption": {
          "type": "text",
          "analyzer": "standard",
          "fields": {
            "keyword": { "type": "keyword" }
          }
        },
        "location": { "type": "text" },
        "hashtags": { "type": "keyword" },
        "like_count": { "type": "integer" },
        "comment_count": { "type": "integer" },
        "media_url": { "type": "keyword", "index": false },
        "thumbnail_url": { "type": "keyword", "index": false },
        "media_type": { "type": "keyword" },
        "is_deleted": { "type": "boolean" },
        "created_at": { "type": "date" }
      }
    }
  }'

echo ""

# Create hashtags index
echo "Creating hashtags index..."
curl -X PUT "$OPENSEARCH_URL/hashtags" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0
    },
    "mappings": {
      "properties": {
        "hashtag_id": { "type": "keyword" },
        "tag": {
          "type": "text",
          "analyzer": "standard",
          "fields": {
            "keyword": { "type": "keyword" },
            "autocomplete": {
              "type": "search_as_you_type"
            }
          }
        },
        "post_count": { "type": "integer" },
        "created_at": { "type": "date" }
      }
    }
  }'

echo ""
echo "OpenSearch indexes created!"
echo ""
echo "Access OpenSearch Dashboards: http://localhost:5601"