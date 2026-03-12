# Vistagram

A production-grade social media platform built with microservices architecture, designed to scale like Instagram.

## Overview

Vistagram is a full-stack Instagram clone that demonstrates production-ready microservices architecture. Unlike typical clone projects, this implementation focuses on scalability, performance, and real-world engineering practices.

The project separates concerns across seven independent microservices, each with its own database and scaling characteristics. It implements proper caching strategies, event-driven architecture, and follows cloud-native design patterns.

### Key Differentiators

- Microservices architecture with independent scaling
- Proper data isolation with separate databases per service
- Event-driven communication using message queues
- Intelligent caching with Redis for performance
- Object storage with MinIO for media files
- Full-text search with OpenSearch
- Complete CI/CD pipeline with automated testing
- Production-ready observability and monitoring

## Architecture

### High-Level Architecture

The system follows a microservices architecture pattern with the following components:

<img src="images/High-Level Design.jpg" width="700" />

### Microservices

#### User Service
Handles user authentication, profile management, and Stories feature.

**Responsibilities:**
- User registration and login with JWT
- Profile CRUD operations
- Stories creation and expiration (24 hours)
- Story views tracking
- Account privacy settings

**Database:** `vistagram_users`

#### Post Service
Manages post creation, editing, and deletion.

**Responsibilities:**
- Post creation with captions and locations
- Post editing and soft deletion
- Post metadata management
- Media association

**Database:** `vistagram_posts`

#### Social Service
Handles all social interactions between users.

**Responsibilities:**
- Follow/unfollow relationships
- Post likes and unlikes
- Comments and replies
- User mentions and tagging

**Database:** `vistagram_social`

#### Feed Service
Generates personalized feeds using ranking algorithms.

**Responsibilities:**
- Home feed generation (followed users)
- Explore feed (trending content)
- User profile feed
- Feed ranking and caching
- Celebrity account handling (pull model for users with >10k followers)

**Database:** `vistagram_feed`

**Caching Strategy:**
- Home feed: 5 minutes TTL
- Explore feed: 5 minutes TTL
- User feed: 10 minutes TTL

#### Media Service
Processes and stores uploaded media files.

**Responsibilities:**
- Image upload and validation
- Multiple variant generation (large, medium, thumbnail)
- Image compression and optimization
- Metadata extraction
- MinIO storage management

**Storage:** MinIO (S3-compatible object storage)

#### Notification Service
Delivers real-time notifications to users.

**Responsibilities:**
- Event consumption from RabbitMQ
- Notification creation and storage
- WebSocket connections (ready for implementation)
- Push notification support

**Database:** `vistagram_notifications`

#### Search Service
Provides full-text search capabilities.

**Responsibilities:**
- User search by username and name
- Hashtag search with trending scores
- Post search by caption
- Autocomplete suggestions
- Search result caching

**Search Engine:** OpenSearch

### Communication Patterns

**Synchronous Communication:**
- Client to Gateway: HTTPS/REST
- Gateway to Services: HTTP/REST

**Asynchronous Communication:**
- Service-to-Service Events: RabbitMQ
- Event Types: post_created, media_uploaded, user_followed, post_liked

## Tech Stack

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** JavaScript
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Express-validator
- **Image Processing:** Sharp
- **Testing:** Jest

### Frontend

- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State Management:** Context API
- **HTTP Client:** Axios
- **Styling:** Inline styles (Instagram-like)

### Infrastructure

- **Databases:** PostgreSQL 14
- **Cache:** Redis 7
- **Message Queue:** RabbitMQ 3
- **Object Storage:** MinIO
- **Search:** OpenSearch 2
- **API Gateway:** NGINX
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitLab CI/CD

### DevOps

- **Container Orchestration:** Docker Compose
- **Testing:** Jest (23 tests)
- **Code Quality:** ESLint
- **Version Control:** Git
- **CI/CD:** GitLab Pipelines

## Features

### Implemented Features

**User Management:**
- User registration with email verification
- Login with JWT authentication
- User profiles with bio and privacy settings
- Edit profile (name, bio, private account)
- Follow/unfollow users
- Follower and following lists

**Content Creation:**
- Photo upload with drag-and-drop
- Three-step post creation flow
- Caption with character limit (2200)
- Location tagging
- Instagram Stories with 24-hour expiration
- Story viewer with auto-play and progress tracking

**Social Interactions:**
- Like/unlike posts
- Comment on posts
- Double-tap to like (optimistic UI)
- Save posts
- View like and comment counts

**Feed System:**
- Home feed (posts from followed users)
- Explore feed (trending posts with mosaic grid)
- User profile feed (post grid)
- Infinite scroll with pagination
- Feed ranking algorithm
- Smart caching for performance

**Discovery:**
- User search with autocomplete
- Hashtag search
- Hashtag pages with filtered posts
- Search tabs (All, Users, Hashtags)
- Trending content

**User Interface:**
- Post detail modal
- Stories viewer (keyboard controls, progress bars)
- Responsive design elements
- Loading states and skeletons
- Error handling with user feedback
- Optimistic UI updates

### Features in Development

- Direct messaging
- Real-time notifications via WebSocket
- Video uploads and playback
- Multiple image posts (carousel)
- Story replies
- Post sharing
- Saved collections

## Prerequisites

Before running this project, ensure you have the following installed:

- **Docker:** Version 20.10 or higher
- **Docker Compose:** Version 2.0 or higher
- **Node.js:** Version 18 or higher (for local development)
- **Git:** Latest version
- **ngrok:** For exposing local server (optional, for live demo)

Verify installations:
```bash
docker --version
docker-compose --version
node --version
npm --version
git --version
```

## Installation

### Clone the Repository

```bash
git clone https://github.com/bitgladiator/vistagram.git
cd vistagram
```

### Environment Setup

Create environment file for Docker services:

```bash
cp docker/.env.example docker/.env.docker
```

Edit `docker/.env.docker` with your configuration:

```env
# Database
POSTGRES_USER=vistagram
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_TTL=300

# RabbitMQ
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=vistagram
RABBITMQ_PASSWORD=your_secure_password

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=your_secure_password
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_BUCKET=vistagram-media

# OpenSearch
OPENSEARCH_HOST=opensearch
OPENSEARCH_PORT=9200

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Service Ports
USER_SERVICE_PORT=3001
POST_SERVICE_PORT=3002
SOCIAL_SERVICE_PORT=3003
FEED_SERVICE_PORT=3004
MEDIA_SERVICE_PORT=3005
NOTIFICATION_SERVICE_PORT=3006
SEARCH_SERVICE_PORT=3007
```

Create frontend environment file:

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost
```

For ngrok deployment:
```env
VITE_API_URL=https://your-ngrok-subdomain.ngrok-free.dev
```

## Configuration

### Database Initialization

Database schemas are automatically applied on first startup. Schemas are located in:

```
databases/postgres/schemas/
├── 01_init.sql
├── 02_users_schema.sql
├── 03_posts_schema.sql
├── 04_social_schema.sql
├── 05_notifications_schema.sql
├── 06_feed_schema.sql
└── stories_schema.sql
```

### MinIO Bucket Setup

MinIO bucket is automatically created on startup. Configure bucket name in environment variables.

### RabbitMQ Exchanges

RabbitMQ exchanges and queues are automatically declared by services on startup.

## Running the Application

### Using the Start Script (Recommended)

The project includes a convenient startup script:

```bash
./scripts/start-vistagram.sh
```

This script will:
1. Verify Docker and ngrok installation
2. Check for environment files
3. Start all Docker containers
4. Launch ngrok tunnel with static domain
5. Display all service URLs

### Manual Docker Compose

Start all services:

```bash
cd docker
docker-compose --env-file .env.docker up -d
```

Check service status:

```bash
docker-compose ps
```

View logs:

```bash
docker-compose logs -f [service-name]
```

Stop all services:

```bash
docker-compose down
```

Stop and remove volumes:

```bash
docker-compose down -v
```

### Frontend Development

For local frontend development:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:5173

### Accessing the Application

**Local Access:**
- Frontend: http://localhost:5173
- API Gateway: http://localhost
- MinIO Console: http://localhost:9001

**Live Demo (ngrok):**
- https://photobathic-epiblastic-noble.ngrok-free.dev

### Service Endpoints

Individual services run on the following ports:

- NGINX Gateway: 80
- User Service: 3001
- Post Service: 3002
- Social Service: 3003
- Feed Service: 3004
- Media Service: 3005
- Notification Service: 3006
- Search Service: 3007
- PostgreSQL: 5432
- Redis: 6379
- RabbitMQ: 5672
- RabbitMQ Management: 15672
- MinIO: 9000
- MinIO Console: 9001
- OpenSearch: 9200

## API Documentation

### Authentication

All protected endpoints require JWT authentication:

```
Authorization: Bearer <token>
x-user-id: <user_id>
```

### User Endpoints

```
POST   /api/v1/users/register
POST   /api/v1/users/login
GET    /api/v1/users/:user_id
PUT    /api/v1/users/:user_id
```

### Post Endpoints

```
POST   /api/v1/posts
GET    /api/v1/posts/:post_id
PUT    /api/v1/posts/:post_id
DELETE /api/v1/posts/:post_id
```

### Social Endpoints

```
POST   /api/v1/social/follow/:user_id
DELETE /api/v1/social/unfollow/:user_id
POST   /api/v1/social/like/:post_id
DELETE /api/v1/social/unlike/:post_id
POST   /api/v1/social/comment/:post_id
GET    /api/v1/social/comments/:post_id
```

### Feed Endpoints

```
GET    /api/v1/feed/home?page=1&limit=10
GET    /api/v1/feed/explore?page=1&limit=20
GET    /api/v1/feed/user/:user_id?page=1&limit=12
DELETE /api/v1/feed/cache
```

### Media Endpoints

```
POST   /api/v1/media/upload
```

### Search Endpoints

```
GET    /api/v1/search?q=query
GET    /api/v1/search/posts?q=query&limit=20
GET    /api/v1/search/autocomplete?q=query
```

### Stories Endpoints

```
POST   /api/v1/stories
GET    /api/v1/stories/feed
GET    /api/v1/stories/user/:user_id
POST   /api/v1/stories/:story_id/view
DELETE /api/v1/stories/:story_id
GET    /api/v1/stories/:story_id/viewers
```

### Response Format

**Success Response:**
```json
{
  "status": "success",
  "data": {
    "user": { }
  },
  "meta": {
    "timestamp": "2025-02-17T10:30:00Z"
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  },
  "meta": {
    "timestamp": "2025-02-17T10:30:00Z"
  }
}
```

## Testing

### Running Tests

Run all tests:

```bash
npm test
```

Run tests for specific service:

```bash
cd services/user-service
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

### Test Structure

```
services/user-service/
└── tests/
    ├── unit/
    │   ├── controllers/
    │   ├── models/
    │   └── utils/
    └── integration/
        └── api/
```

### Current Test Coverage

- User Service: 23 tests passing
- Other services: Tests in development

## Deployment

### Docker Deployment

Build and deploy all services:

```bash
docker-compose -f docker/docker-compose.yml --env-file docker/.env.docker up -d --build
```

Rebuild specific service:

```bash
docker-compose -f docker/docker-compose.yml --env-file docker/.env.docker up -d --build user-service
```

### CI/CD Pipeline

The project includes a GitLab CI/CD pipeline:

**Pipeline Stages:**
1. Test: Run Jest tests for all services
2. Build: Build Docker images
3. Deploy: Deploy to staging/production

**Pipeline File:** `.gitlab-ci.yml`

### Production Considerations

**Before deploying to production:**

1. Change all default passwords in environment files
2. Use strong JWT secret
3. Enable HTTPS with valid SSL certificates
4. Configure proper CORS origins
5. Set up database backups
6. Configure log aggregation
7. Set up monitoring and alerting
8. Implement rate limiting per user
9. Configure CDN for media files
10. Set up Redis cluster for high availability


## Development

### Adding a New Service

1. Create service directory under `services/`
2. Initialize with `npm init`
3. Install dependencies
4. Create Dockerfile
5. Add service to `docker-compose.yml`
6. Create database schema if needed
7. Add routes to NGINX configuration
8. Update environment files

### Code Standards

- Use ESLint for code linting
- Follow Airbnb JavaScript style guide
- Write unit tests for all controllers
- Document all API endpoints
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### Database Migrations

Database migrations are handled manually:

1. Create new SQL file in `databases/postgres/schemas/`
2. Apply migration:
   ```bash
   docker exec -i vistagram-postgres psql -U vistagram -d database_name < schema_file.sql
   ```

### Debugging

View logs for a specific service:

```bash
docker logs vistagram-user-service -f
```

Access PostgreSQL:

```bash
docker exec -it vistagram-postgres psql -U vistagram -d vistagram_users
```

Access Redis CLI:

```bash
docker exec -it vistagram-redis redis-cli
```

Access RabbitMQ Management:

Open http://localhost:15672 (guest/guest)

## Performance Considerations

### Caching Strategy

**Feed Caching:**
- Home feed cached for 5 minutes per user
- Explore feed cached for 5 minutes globally
- User profile feed cached for 10 minutes
- Cache invalidation on new post creation

**Database Query Optimization:**
- Indexes on frequently queried columns
- Query result caching in Redis
- Connection pooling
- Read replicas for heavy read workload (future)

**Image Optimization:**
- Three image variants (large, medium, thumbnail)
- Lazy loading in frontend
- CDN delivery (future)

### Scalability

**Horizontal Scaling:**
- Stateless services can scale independently
- Load balancing at NGINX layer
- Database sharding capability (future)

**Vertical Scaling:**
- Increase container resources as needed
- Optimize database queries
- Add read replicas

## Security

### Authentication & Authorization

- JWT-based authentication with 7-day expiration
- Password hashing with bcrypt (salt rounds: 10)
- Protected routes with middleware
- User ID validation on all mutations

### Data Protection

- SQL injection prevention via parameterized queries
- XSS protection with input sanitization
- CORS configured for allowed origins
- Rate limiting at NGINX layer

### Best Practices

- Never commit environment files
- Rotate JWT secrets regularly
- Use HTTPS in production
- Implement proper error handling
- Log security events
- Regular dependency updates


## Acknowledgments

Built as a demonstration of production-grade microservices architecture and modern web development practices.

