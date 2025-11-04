# Build script for AI Travel Planner Docker images

Write-Host "Building AI Travel Planner Docker images..." -ForegroundColor Green

# Build backend image
Write-Host "Building backend image..." -ForegroundColor Yellow
Set-Location -Path "backend"
docker build -t ai-travel-planner-backend:latest .
Set-Location -Path ".."

# Build frontend image
Write-Host "Building frontend image..." -ForegroundColor Yellow
Set-Location -Path "frontend"
docker build -t ai-travel-planner-frontend:latest .
Set-Location -Path ".."

Write-Host "Docker images built successfully!" -ForegroundColor Green
Write-Host "Backend image: ai-travel-planner-backend:latest" -ForegroundColor Cyan
Write-Host "Frontend image: ai-travel-planner-frontend:latest" -ForegroundColor Cyan