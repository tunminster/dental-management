# 🐳 Docker Troubleshooting Guide

## Common Issues and Solutions

### 1. "vite: not found" Error
**Problem:** Vite is not installed in the Docker container
**Solution:** ✅ Fixed - Updated Dockerfile to install all dependencies including dev dependencies

### 2. Container Won't Start
**Check these:**

```bash
# Check if image was built successfully
docker images | grep dental-dashboard

# Check container status
docker ps -a | grep dental-dashboard

# Check container logs
docker logs dental-dashboard-container

# Check if port is available
netstat -tulpn | grep :3000
```

### 3. Build Fails
**Debug steps:**

```bash
# Build with verbose output
docker build --no-cache -t dental-dashboard .

# Check build logs
cat build.log

# Test build step by step
docker run -it --rm node:18-alpine sh
# Then manually run: npm ci && npm run build
```

### 4. Container Runs But App Not Accessible
**Check:**

```bash
# Test if container is responding
curl http://localhost:3000

# Check nginx logs inside container
docker exec dental-dashboard-container cat /var/log/nginx/error.log

# Check if files were copied correctly
docker exec dental-dashboard-container ls -la /usr/share/nginx/html/
```

## Quick Commands

### Build and Run:
```bash
./docker-run.sh
```

### Manual Build:
```bash
docker build -t dental-dashboard .
```

### Manual Run:
```bash
docker run -d --name dental-dashboard-container -p 3000:80 dental-dashboard
```

### Stop and Clean:
```bash
docker stop dental-dashboard-container
docker rm dental-dashboard-container
docker rmi dental-dashboard
```

### Debug Container:
```bash
docker exec -it dental-dashboard-container sh
```

## Expected Output

When working correctly, you should see:
- ✅ Build successful
- ✅ Container started successfully  
- 🌐 Application available at: http://localhost:3000
- 📊 Container status shows "Up" and port mapping 3000->80
