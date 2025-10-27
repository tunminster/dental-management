#!/bin/bash

# Docker Build and Run Script for Dental Management Dashboard
# This script helps debug Docker issues

echo "🐳 Building Docker image..."

# Build the image with debug output
docker build \
  --build-arg VITE_API_BASE_URL=https://api-demo.bytheapp.com \
  --build-arg VITE_DOMAIN=localhost \
  --build-arg VITE_APP_URL=http://localhost \
  -t dental-dashboard \
  . 2>&1 | tee build.log

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo "🚀 Starting container..."
    docker run -d \
      --name dental-dashboard-container \
      -p 3000:80 \
      dental-dashboard
    
    if [ $? -eq 0 ]; then
        echo "✅ Container started successfully!"
        echo "🌐 Application available at: http://localhost:3000"
        
        # Show container status
        echo "📊 Container status:"
        docker ps | grep dental-dashboard-container
        
        # Show logs
        echo "📝 Container logs:"
        docker logs dental-dashboard-container
        
    else
        echo "❌ Failed to start container"
        echo "📝 Container logs:"
        docker logs dental-dashboard-container
    fi
else
    echo "❌ Build failed!"
    echo "📝 Check build.log for details"
fi
