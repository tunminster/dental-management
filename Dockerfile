# Multi-stage build for React app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_BASE_URL=https://api-demo.bytheapp.com
ARG VITE_APP_NAME=Dental Management Dashboard
ARG VITE_APP_VERSION=1.0.0
ARG VITE_ENVIRONMENT=production
ARG VITE_API_TIMEOUT=15000
ARG VITE_API_RETRY_ATTEMPTS=3
ARG VITE_DEBUG=false
ARG VITE_LOG_LEVEL=error
ARG VITE_ENABLE_ANALYTICS=true
ARG VITE_ENABLE_ERROR_REPORTING=true
ARG VITE_DOMAIN=localhost
ARG VITE_APP_URL=http://localhost

# Set environment variables
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT
ENV VITE_API_TIMEOUT=$VITE_API_TIMEOUT
ENV VITE_API_RETRY_ATTEMPTS=$VITE_API_RETRY_ATTEMPTS
ENV VITE_DEBUG=$VITE_DEBUG
ENV VITE_LOG_LEVEL=$VITE_LOG_LEVEL
ENV VITE_ENABLE_ANALYTICS=$VITE_ENABLE_ANALYTICS
ENV VITE_ENABLE_ERROR_REPORTING=$VITE_ENABLE_ERROR_REPORTING
ENV VITE_DOMAIN=$VITE_DOMAIN
ENV VITE_APP_URL=$VITE_APP_URL

# Debug: Show what's installed
RUN npm list vite

# Build the application
RUN npm run build

# Debug: Show build output
RUN ls -la dist/

# Production stage with nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
