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

## 1.2 Media Upload & Processing Pipeline

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
#### Image Processing Requirements
- Original: Store as-is (compressed)
- 1080x1080: Full size display
- 640x640: Feed display
- 320x320: Thumbnail
- 150x150: Profile picture size

#### Video Processing
- Transcode to multiple bitrates (adaptive streaming)
- Generate thumbnail from first frame
- Extract duration and metadata
- Compress for optimal delivery

### 1.3 Social Graph Management

#### Follow/Unfollow System

**Write Path:**
```
1. User A follows User B
2. Write to follows table:
   INSERT INTO follows (follower_id, followee_id, created_at)
3. Update counters (eventual consistency):
   - User A following_count++
   - User B follower_count++
4. Add User B's posts to User A's feed (async)
5. Publish event for notifications
```

**Read Path (Get Followers):**
```
1. Check Redis cache: followers:user_id
2. If miss, query database:
   SELECT follower_id FROM follows WHERE followee_id = ?
3. Paginate results (cursor-based)
4. Cache in Redis (TTL: 1 hour)
```
#### Handling Celebrity Accounts
- Don't fan-out posts to all followers on write
- Use pull model when followers request feed
- Cache celebrity's recent posts heavily
- Use dedicated read replicas for popular accounts

### 4.4 Notification System

**Architecture:**
```
Event Source → Message Queue → Notification Service → Push/WebSocket
```

#### Notification Types
1. **Social Notifications**
   - New follower
   - Post liked
   - Post commented
   - User tagged

2. **Content Notifications**
   - Posts from followed users
   - Trending content

#### Implementation
```
1. Action occurs (e.g., like)
2. Publish event to RabbitMQ
3. Notification Service consumes event
4. Check user notification preferences
5. Create notification entry in DB
6. Send via appropriate channel:
   - Push notification
   - WebSocket for active users
   - Email digest (batched)
```

#### Notification Batching
- Group similar notifications: "User A and 10 others liked your post"
- Batch email notifications (hourly/daily digest)
- Rate limit per user to prevent spam

### 1.5 Search System

**Multi-tiered Search:**

1. **User Search**
   - Index in OpenSearch
   - Search by username, full_name
   - Boost verified accounts
   - Autocomplete support

2. **Hashtag Search**
   - Real-time trending calculation
   - Index in OpenSearch
   - Count posts per hashtag
   - Time-decay for trending

3. **Content Discovery**
   - ML-based recommendations
   - Collaborative filtering
   - Content-based filtering

**Search Query Flow:**
<img src="images/Search Flow.jpg" width="600" />