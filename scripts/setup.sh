#!/bin/bash

echo "Setting up Vistagram development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "Docker is running"

# Create data directories
echo "Creating data directories..."
mkdir -p databases/postgres/data
mkdir -p databases/redis/data
mkdir -p databases/minio/data
mkdir -p databases/rabbitmq/data

# Start services
echo "Starting Docker services..."
cd docker
docker-compose up -d

# Wait for services to be healthy
echo "Waiting for services to be ready..."
sleep 10

# Check service health
echo "Checking service health..."
docker-compose ps

echo ""
echo "Setup complete!"
echo ""
echo "Access points:"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo "  - MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)"
echo "  - RabbitMQ Management: http://localhost:15672 (vistagram/vistagram_dev_password)"
echo ""
echo "Next steps:"
echo "  1. Create PostgreSQL schemas"
echo "  2. Initialize User Service"
echo ""