# Kubernetes Deployment Troubleshooting Guide

## Issue: Connection Refused Error (502 Bad Gateway)

The error shows:
```
connect() failed (111: Connection refused) while connecting to upstream, 
upstream: "http://127.0.0.1:8181/"
```

## Root Cause Analysis

The ingress controller is trying to connect to port 8181 instead of port 80, which suggests:

1. **Service Discovery Issue**: The service might not be properly exposing the container port
2. **Ingress Controller Configuration**: There might be a configuration issue with the ingress controller
3. **Pod Not Ready**: The pods might not be ready to receive traffic

## Debugging Steps

### 1. Check Pod Status
```bash
kubectl get pods -n by-the-app-prod -l app=dental-management-app
kubectl describe pod <pod-name> -n by-the-app-prod
```

### 2. Check Service Status
```bash
kubectl get svc -n by-the-app-prod dental-management-app-service
kubectl describe svc dental-management-app-service -n by-the-app-prod
```

### 3. Check Ingress Status
```bash
kubectl get ingress -n by-the-app-prod dental-management-app-ingress
kubectl describe ingress dental-management-app-ingress -n by-the-app-prod
```

### 4. Check Pod Logs
```bash
kubectl logs <pod-name> -n by-the-app-prod
```

### 5. Test Service Connectivity
```bash
# Port forward to test the service directly
kubectl port-forward svc/dental-management-app-service 8080:80 -n by-the-app-prod

# Then test locally
curl http://localhost:8080/health
```

### 6. Check Ingress Controller Logs
```bash
# Find the ingress controller pod
kubectl get pods -n ingress-nginx

# Check logs
kubectl logs <ingress-controller-pod> -n ingress-nginx
```

## Potential Fixes

### Fix 1: Verify Service Configuration
The service should expose port 80 and target port 80:
```yaml
spec:
  type: ClusterIP
  selector:
    app: dental-management-app
  ports:
  - name: http
    port: 80
    targetPort: 80
    protocol: TCP
```

### Fix 2: Add Health Checks
Ensure the container has proper health checks:
```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 10
  periodSeconds: 5
```

### Fix 3: Check Container Port
Verify the container is actually listening on port 80:
```bash
kubectl exec -it <pod-name> -n by-the-app-prod -- netstat -tlnp
```

### Fix 4: Ingress Controller Configuration
The ingress controller might have a default upstream configuration that's incorrect. Check if there are any global ingress controller configurations affecting this.

## Quick Test Commands

```bash
# Check if pods are running
kubectl get pods -n by-the-app-prod

# Check if service is working
kubectl get endpoints dental-management-app-service -n by-the-app-prod

# Test the health endpoint
kubectl exec -it <pod-name> -n by-the-app-prod -- curl http://localhost/health
```

## Expected Results

- Pods should be in "Running" state
- Service should have endpoints
- Health check should return "healthy"
- Ingress should route traffic to the service on port 80

