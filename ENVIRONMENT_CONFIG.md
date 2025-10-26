# 🔧 Environment Configuration Guide

## ⚠️ **IMPORTANT: No Hardcoded Values**

The application now requires environment variables for all configuration. **No hardcoded URLs or values remain in the code.**

## 📋 **Environment Variables Overview**

Your dental management dashboard now supports comprehensive environment variable configuration for different deployment environments.

### 🏠 **Local Development (.env.local)**

```bash
# API Configuration
VITE_API_BASE_URL=https://api-demo.bytheapp.com

# Application Configuration
REACT_APP_APP_NAME=Dental Management Dashboard
REACT_APP_APP_VERSION=1.0.0

# Environment
REACT_APP_ENVIRONMENT=development

# API Settings
REACT_APP_API_TIMEOUT=10000
REACT_APP_API_RETRY_ATTEMPTS=3

# Debug Settings
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_ERROR_REPORTING=false

# Domain Configuration
REACT_APP_DOMAIN=localhost:5173
REACT_APP_APP_URL=http://localhost:5173
```

### 🚀 **Production (.env.production)**

```bash
# API Configuration
VITE_API_BASE_URL=https://api-demo.bytheapp.com

# Application Configuration
REACT_APP_APP_NAME=Dental Management Dashboard
REACT_APP_APP_VERSION=1.0.0

# Environment
REACT_APP_ENVIRONMENT=production

# API Settings
REACT_APP_API_TIMEOUT=15000
REACT_APP_API_RETRY_ATTEMPTS=3

# Debug Settings
REACT_APP_DEBUG=false
REACT_APP_LOG_LEVEL=error

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ERROR_REPORTING=true

# Domain Configuration (update with your actual domain)
REACT_APP_DOMAIN=dental-dashboard.yourdomain.com
REACT_APP_APP_URL=https://dental-dashboard.yourdomain.com
```

## 🐳 **Docker Environment Variables**

The Dockerfile now supports build-time environment variables:

**⚠️ IMPORTANT:** `REACT_APP_API_BASE_URL`, `REACT_APP_DOMAIN`, and `REACT_APP_APP_URL` are **REQUIRED** and have no default values.

```bash
# Build with custom environment variables
docker build \
  --build-arg REACT_APP_API_BASE_URL=https://your-api.com \
  --build-arg REACT_APP_DOMAIN=yourdomain.com \
  --build-arg REACT_APP_APP_URL=https://yourdomain.com \
  -t dental-management-dashboard .
```

## ☸️ **Kubernetes Environment Variables**

### Option 1: Direct Environment Variables (k8s-deployment.yaml)

```yaml
env:
- name: REACT_APP_API_BASE_URL
  value: "https://api-demo.bytheapp.com"
- name: REACT_APP_DOMAIN
  value: "dental-dashboard.yourdomain.com"
- name: REACT_APP_APP_URL
  value: "https://dental-dashboard.yourdomain.com"
```

### Option 2: ConfigMap (k8s-deployment-with-configmap.yaml)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: dental-management-config
data:
  REACT_APP_API_BASE_URL: "https://api-demo.bytheapp.com"
  REACT_APP_DOMAIN: "dental-dashboard.yourdomain.com"
  REACT_APP_APP_URL: "https://dental-dashboard.yourdomain.com"
```

## 🔧 **Environment Variable Reference**

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REACT_APP_API_BASE_URL` | Base URL for API calls | `https://api-demo.bytheapp.com` | Yes |
| `REACT_APP_APP_NAME` | Application name | `Dental Management Dashboard` | No |
| `REACT_APP_APP_VERSION` | Application version | `1.0.0` | No |
| `REACT_APP_ENVIRONMENT` | Environment (development/production) | `development` | No |
| `REACT_APP_API_TIMEOUT` | API timeout in milliseconds | `10000` | No |
| `REACT_APP_API_RETRY_ATTEMPTS` | Number of API retry attempts | `3` | No |
| `REACT_APP_DEBUG` | Enable debug mode | `true` | No |
| `REACT_APP_LOG_LEVEL` | Log level (debug/info/error) | `debug` | No |
| `REACT_APP_ENABLE_ANALYTICS` | Enable analytics | `false` | No |
| `REACT_APP_ENABLE_ERROR_REPORTING` | Enable error reporting | `false` | No |
| `REACT_APP_DOMAIN` | Application domain | `localhost:5173` | No |
| `REACT_APP_APP_URL` | Full application URL | `http://localhost:5173` | No |

## 🚀 **Deployment Instructions**

### Local Development

1. **Copy environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Update variables in .env.local:**
   ```bash
   # Edit .env.local with your values
   REACT_APP_API_BASE_URL=https://your-api.com
   REACT_APP_DOMAIN=localhost:5173
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

### Production Build

1. **Update production environment:**
   ```bash
   # Edit .env.production with your production values
   REACT_APP_API_BASE_URL=https://your-production-api.com
   REACT_APP_DOMAIN=yourdomain.com
   REACT_APP_APP_URL=https://yourdomain.com
   ```

2. **Build for production:**
   ```bash
   npm run build
   ```

### Docker Deployment

1. **Build with environment variables:**
   ```bash
   docker build \
     --build-arg REACT_APP_API_BASE_URL=https://your-api.com \
     --build-arg REACT_APP_DOMAIN=yourdomain.com \
     --build-arg REACT_APP_APP_URL=https://yourdomain.com \
     -t dental-management-dashboard .
   ```
   
   **⚠️ Note:** `REACT_APP_API_BASE_URL`, `REACT_APP_DOMAIN`, and `REACT_APP_APP_URL` are required - no default values provided.

2. **Run container:**
   ```bash
   docker run -p 3000:80 dental-management-dashboard
   ```

### Kubernetes Deployment

1. **Update ConfigMap with your values:**
   ```bash
   # Edit k8s-deployment-with-configmap.yaml
   kubectl apply -f k8s-deployment-with-configmap.yaml
   ```

2. **Or update direct environment variables:**
   ```bash
   # Edit k8s-deployment.yaml
   kubectl apply -f k8s-deployment.yaml
   ```

## 🔒 **Security Notes**

- **Never commit** `.env.local` or `.env.production` files to version control
- **Use secrets** for sensitive data in Kubernetes
- **Validate** all environment variables before deployment
- **Use HTTPS** for production API URLs

## 🐛 **Troubleshooting**

### Common Issues:

1. **Environment variables not loading:**
   - Ensure variables start with `REACT_APP_`
   - Restart development server after changes
   - Check for typos in variable names

2. **API connection issues:**
   - Verify `REACT_APP_API_BASE_URL` is correct
   - Check CORS settings on your API
   - Ensure API is accessible from your domain

3. **Build failures:**
   - Check for missing required environment variables
   - Verify Docker build arguments
   - Check Kubernetes ConfigMap syntax

### Debug Mode:

Enable debug mode to see environment variable values:

```bash
REACT_APP_DEBUG=true
```

This will log environment variables to the browser console (development only).
