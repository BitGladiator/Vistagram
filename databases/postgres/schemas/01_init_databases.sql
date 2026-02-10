-- Users Database
CREATE DATABASE vistagram_users;

-- Posts Database
CREATE DATABASE vistagram_posts;

-- Social Database
CREATE DATABASE vistagram_social;

-- Notifications Database
CREATE DATABASE vistagram_notifications;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE vistagram_users TO vistagram;
GRANT ALL PRIVILEGES ON DATABASE vistagram_posts TO vistagram;
GRANT ALL PRIVILEGES ON DATABASE vistagram_social TO vistagram;
GRANT ALL PRIVILEGES ON DATABASE vistagram_notifications TO vistagram;