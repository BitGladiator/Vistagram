# From vistagram directory
for service in user-service post-service social-service feed-service media-service notification-service search-service; do
cat > services/$service/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["node", "src/server.js"]
EOF
done