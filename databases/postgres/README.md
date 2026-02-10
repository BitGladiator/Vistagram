# PostgreSQL Database Documentation

## Databases

Vistagram uses 4 separate PostgreSQL databases for domain separation:

1. **vistagram_users** - User Service
2. **vistagram_posts** - Post Service
3. **vistagram_social** - Social Service
4. **vistagram_notifications** - Notification Service

## Schema Files

Schemas are automatically initialized when PostgreSQL starts:
- `01_init_databases.sql` - Creates databases
- `02_users_schema.sql` - Users, sessions, settings
- `03_posts_schema.sql` - Posts, media, hashtags
- `04_social_schema.sql` - Follows, likes, comments
- `05_notifications_schema.sql` - Notifications, push tokens

## Connection Details

**Local Development:**
- Host: `localhost`
- Port: `5432`
- Username: `vistagram`
- Password: `vistagram_dev_password`

## Common Commands
```bash
# Connect to PostgreSQL
docker exec -it vistagram-postgres psql -U vistagram

# Connect to specific database
docker exec -it vistagram-postgres psql -U vistagram -d vistagram_users

# Run SQL file
docker exec -i vistagram-postgres psql -U vistagram -d vistagram_users < schema.sql

# Backup database
docker exec vistagram-postgres pg_dump -U vistagram vistagram_users > backup.sql

# Restore database
docker exec -i vistagram-postgres psql -U vistagram vistagram_users < backup.sql
```

## Schema Relationships

### Users → Posts
- `posts.user_id` references `users.user_id` (cross-database, enforced at application level)

### Users → Social
- `follows.follower_id` and `follows.followee_id` reference `users.user_id`
- `likes.user_id` references `users.user_id`
- `comments.user_id` references `users.user_id`

### Posts → Social
- `likes.post_id` references `posts.post_id`
- `comments.post_id` references `posts.post_id`