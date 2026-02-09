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