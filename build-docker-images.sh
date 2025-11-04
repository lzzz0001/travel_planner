#!/bin/bash

# Build script for AI Travel Planner Docker images

echo "Building AI Travel Planner Docker images..."

# Build backend image
echo "Building backend image..."
cd backend
docker build -t ai-travel-planner-backend:latest .
cd ..

# Build frontend image
echo "Building frontend image..."
cd frontend
docker build -t ai-travel-planner-frontend:latest .
cd ..

echo "Docker images built successfully!"
echo "Backend image: ai-travel-planner-backend:latest"
echo "Frontend image: ai-travel-planner-frontend:latest"