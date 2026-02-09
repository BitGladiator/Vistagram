# Vistagram Framework Documentation

## Project Overview

**Vistagram** is a scalable social media platform for sharing visual moments and connecting through photography. This document outlines the complete system design framework, architectural decisions, and implementation strategy.

---

## 1. System Requirements

### 1.1 Functional Requirements

#### Core Features
- **User Management**
  - User registration and authentication
  - Profile creation and editing (bio, profile picture, username)
  - Account privacy settings (public/private)

- **Content Management**
  - Upload photos and videos with captions
  - Add hashtags and location tags
  - Edit/delete own posts
  - Support multiple image formats (JPEG, PNG, HEIC)
  - Video processing and compression

- **Social Interactions**
  - Follow/unfollow users
  - Like posts
  - Comment on posts
  - Reply to comments
  - Tag users in posts

- **Feed System**
  - Personalized home feed (posts from followed users)
  - Chronological and algorithm-based feed options
  - Explore feed (discover new content)
  - User profile feed (view specific user's posts)

- **Discovery**
  - Search users by username
  - Search hashtags
  - Trending content
  - Location-based discovery

- **Notifications**
  - Real-time notifications for likes, comments, follows
  - Push notifications support
  - In-app notification center

### 1.2 Non-Functional Requirements

#### Scale Targets
<img src="images/Target.jpg" width="600" />

#### Performance Requirements
<img src="images/Performance.jpg" width="600" />

#### Availability & Reliability
<img src="images/Availablity.jpg" width="600" />

#### Consistency Requirements
<img src="images/Consistency.jpg" width="600" />

---

## 2. High-Level Architecture
<img src="images/High-Level%20Design.jpg" width="700" />

### 2.2 Core Components

#### Client Layer
- **Web Application**: React/Next.js SPA
- **Mobile Apps**: iOS (Swift) and Android (Kotlin)
- **Progressive Web App** (PWA) support

#### Edge Layer
- **CDN**: CloudFlare/CloudFront for static assets and media
- **Load Balancers**: Distribute traffic across API servers
- **DDoS Protection**: Rate limiting and security

#### API Gateway
- **Authentication & Authorization**: JWT tokens
- **Request Routing**: Direct requests to appropriate services
- **Rate Limiting**: Prevent abuse
- **API Versioning**: Support multiple API versions
- **Protocol Translation**: REST to gRPC

#### Service Layer (Microservices)
<img src="images/Service%20Architecture.jpg" width="700" />

---

## 3. Data Architecture

### 3.1 Database Strategy

#### Primary Databases

**1. User Data - PostgreSQL (Relational)**
<img src="images/User%20Schema.jpg" width="500" />

**2. Post Data - PostgreSQL (Relational)**
<img src="images/Post%20Schema.jpg" width="500" />

**3. Social Graph - PostgreSQL (Relational)**
<img src="images/Social.jpg" width="500" />

### 3.2 Caching Strategy

**Redis Cache Layers:**

1. **Hot Data Cache** (TTL: 1 hour)
   - User profiles of active users
   - Popular posts
   - Trending hashtags

2. **Feed Cache** (TTL: 5 minutes)
   - Pre-computed home feeds
   - User profile feeds
   - Explore feed

3. **Counter Cache** (No TTL, updated on write)
   - Post like counts
   - Comment counts
   - Follower counts

4. **Session Cache** (TTL: 24 hours)
   - User authentication tokens
   - Active sessions

**Cache Invalidation:**
- Write-through for critical data
- Write-behind for analytics
- Event-driven invalidation via message queue

### 3.3 Object Storage

**MinIO (Self-hosted S3-compatible storage)**

```
/media
  /images
    /original
      /{user_id}/{post_id}/{image_id}.jpg
    /processed
      /1080x1080/{user_id}/{post_id}/{image_id}.jpg
      /640x640/{user_id}/{post_id}/{image_id}.jpg
      /320x320/{user_id}/{post_id}/{image_id}.jpg
  /videos
    /original
    /processed
      /720p
      /480p
      /360p
  /profiles
    /{user_id}/profile.jpg
```

**Storage Optimization:**
- Lazy deletion (mark as deleted, cleanup later)
- Compression before storage
- Multiple resolution variants
- CDN integration for fast delivery (Cloudinary)

### 3.4 Search Infrastructure

**OpenSearch (Open-source Elasticsearch alternative)**

```json
{
  "users_index": {
    "user_id": "uuid",
    "username": "text (analyzed)",
    "full_name": "text (analyzed)",
    "bio": "text",
    "follower_count": "integer",
    "is_verified": "boolean"
  },
  "hashtags_index": {
    "hashtag": "keyword",
    "post_count": "integer",
    "trending_score": "float"
  },
  "posts_index": {
    "post_id": "uuid",
    "caption": "text",
    "hashtags": "keyword[]",
    "created_at": "date",
    "like_count": "integer"
  }
}
```

---