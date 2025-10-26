# Multi-stage build for React app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_BASE_URL
ARG REACT_APP_APP_NAME=Dental Management Dashboard
ARG REACT_APP_APP_VERSION=1.0.0
ARG REACT_APP_ENVIRONMENT=production
ARG REACT_APP_API_TIMEOUT=15000
ARG REACT_APP_API_RETRY_ATTEMPTS=3
ARG REACT_APP_DEBUG=false
ARG REACT_APP_LOG_LEVEL=error
ARG REACT_APP_ENABLE_ANALYTICS=true
ARG REACT_APP_ENABLE_ERROR_REPORTING=true
ARG REACT_APP_DOMAIN
ARG REACT_APP_APP_URL

# Set environment variables
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV REACT_APP_APP_NAME=$REACT_APP_APP_NAME
ENV REACT_APP_APP_VERSION=$REACT_APP_APP_VERSION
ENV REACT_APP_ENVIRONMENT=$REACT_APP_ENVIRONMENT
ENV REACT_APP_API_TIMEOUT=$REACT_APP_API_TIMEOUT
ENV REACT_APP_API_RETRY_ATTEMPTS=$REACT_APP_API_RETRY_ATTEMPTS
ENV REACT_APP_DEBUG=$REACT_APP_DEBUG
ENV REACT_APP_LOG_LEVEL=$REACT_APP_LOG_LEVEL
ENV REACT_APP_ENABLE_ANALYTICS=$REACT_APP_ENABLE_ANALYTICS
ENV REACT_APP_ENABLE_ERROR_REPORTING=$REACT_APP_ENABLE_ERROR_REPORTING
ENV REACT_APP_DOMAIN=$REACT_APP_DOMAIN
ENV REACT_APP_APP_URL=$REACT_APP_APP_URL

# Build the application
RUN npm run build

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
