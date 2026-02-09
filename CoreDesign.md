## Core System Designs

### 1.1 Feed Generation System

**Problem**: Generate personalized feed for 100M DAU efficiently

**Solution**: Hybrid Push-Pull Model

#### For Users with Few Followers (< 10K)
**Push Model (Fan-out on Write)**
1. When user posts, push post_id to all followers' feeds
2. Store in Cassandra user_feed table
3. Followers read from pre-computed feed

#### For Users with Many Followers (> 10K - Celebrities)
**Pull Model (Fan-out on Read)**
1. Don't fan-out on write
2. When follower requests feed, fetch posts from these users
3. Merge with regular feed

#### Feed Ranking Algorithm
<img src="images/Feed Ranking.jpg" width="500" />

#### Implementation Flow
<img src="images/Core Feed Design.jpg" width="500" />

## 4.2 Media Upload & Processing Pipeline

#### Upload Flow
```
1. Client requests signed URL from Media Service
2. Media Service generates MinIO presigned URL
3. Client uploads directly to MinIO (bypassing backend)
4. MinIO triggers webhook/processing service
5. Processing service:
   - Validates image
   - Generates thumbnails (multiple sizes)
   - Compresses original
   - Extracts metadata (dimensions, EXIF)
   - Updates database with URLs
   - Publishes event to message queue
6. Post Service receives event, creates post entry
7. Feed Service fans out to followers
```