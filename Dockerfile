FROM node:20-alpine AS base

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Install production dependencies separately to leverage Docker layer caching
COPY package.json ./
RUN npm install --only=production

# Copy application source
COPY . .

# Expose the default app port
EXPOSE 8081

# Use node to run the server (ESM entrypoint)
CMD ["node", "server.js"]

