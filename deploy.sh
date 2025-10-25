#!/bin/bash

# Dental Management Dashboard Deployment Script for AKS
set -e

# Configuration
RESOURCE_GROUP="dental-management-rg"
AKS_CLUSTER="dental-management-aks"
ACR_NAME="dentalmanagementacr"
IMAGE_NAME="dental-management-dashboard"
IMAGE_TAG="latest"
NAMESPACE="dental-management"

echo "🚀 Starting deployment of Dental Management Dashboard to AKS..."

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install Azure CLI first."
    exit 1
fi

# Login to Azure (if not already logged in)
echo "🔐 Checking Azure login status..."
if ! az account show &> /dev/null; then
    echo "Please login to Azure..."
    az login
fi

# Get AKS credentials
echo "📋 Getting AKS credentials..."
az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER --overwrite-existing

# Create namespace if it doesn't exist
echo "🏗️ Creating namespace..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Build and push Docker image to ACR
echo "🐳 Building and pushing Docker image..."
az acr build --registry $ACR_NAME --image $IMAGE_NAME:$IMAGE_TAG .

# Update image in deployment
echo "📝 Updating deployment with new image..."
sed -i "s|image: dental-management-dashboard:latest|image: $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG|g" k8s-deployment.yaml

# Apply Kubernetes manifests
echo "🚀 Deploying to Kubernetes..."
kubectl apply -f k8s-deployment.yaml -n $NAMESPACE

# Wait for deployment to be ready
echo "⏳ Waiting for deployment to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/dental-management-dashboard -n $NAMESPACE

# Get service information
echo "📊 Deployment Status:"
kubectl get pods -n $NAMESPACE
kubectl get services -n $NAMESPACE
kubectl get ingress -n $NAMESPACE

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should be accessible via the ingress URL."
echo "📋 To check logs: kubectl logs -f deployment/dental-management-dashboard -n $NAMESPACE"
