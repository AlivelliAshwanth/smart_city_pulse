# Docker Guide

## Overview

City Pulse Live is containerized using Docker for easy deployment and development.

## Docker Files

- `Dockerfile` - Production frontend build
- `Dockerfile.dev` - Development frontend
- `backend/Dockerfile` - Production backend build
- `backend/Dockerfile.dev` - Development backend
- `docker-compose.yml` - Production orchestration
- `docker-compose.dev.yml` - Development orchestration
- `nginx.conf` - Nginx configuration for frontend

## Quick Start

### Production Build

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access:**
- Frontend: http://localhost
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:3002

### Development Build

```bash
# Build and run with hot reload
docker-compose -f docker-compose.dev.yml up

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

**Access:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3001

## Individual Services

### Build Backend Only

```bash
cd backend
docker build -t city-pulse-backend .
docker run -p 3001:3001 -p 3002:3002 city-pulse-backend
```

### Build Frontend Only

```bash
docker build -t city-pulse-frontend .
docker run -p 80:80 city-pulse-frontend
```

## Environment Variables

Create `.env` file or set in docker-compose.yml:

```env
# Backend
NODE_ENV=production
PORT=3001
WS_PORT=3002
FRONTEND_URL=http://localhost:80
IOT_MQTT_ENABLED=false
IOT_HTTP_ENABLED=true

# Frontend (for dev)
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3002
```

## Docker Commands

### View Running Containers
```bash
docker ps
```

### View Logs
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs -f  # Follow logs
```

### Rebuild After Changes
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Stop and Remove
```bash
docker-compose down
docker-compose down -v  # Remove volumes too
```

### Execute Commands in Container
```bash
docker-compose exec backend sh
docker-compose exec frontend sh
```

## Production Deployment

### Build for Production
```bash
docker-compose build
```

### Run in Background
```bash
docker-compose up -d
```

### Update Environment Variables
Edit `docker-compose.yml` and restart:
```bash
docker-compose down
docker-compose up -d
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :3001
# Kill process or change port in docker-compose.yml
```

### Container Won't Start
```bash
# Check logs
docker-compose logs

# Rebuild
docker-compose build --no-cache
```

### Frontend Can't Connect to Backend
- Ensure backend container is running
- Check network configuration
- Verify environment variables

## Docker Images

### Production Images
- `city-pulse-backend`: Multi-stage build, optimized
- `city-pulse-frontend`: Nginx serving static files

### Development Images
- Hot reload enabled
- Source code mounted as volumes
- Full development dependencies

## Networking

Services communicate via Docker network `city-pulse-network`. Frontend can access backend via service name `backend`.

## Health Checks

Backend includes health check endpoint:
```bash
curl http://localhost:3001/health
```

Docker automatically monitors container health.

## Volume Mounts

### Development
- Source code mounted for hot reload
- `node_modules` excluded via anonymous volume

### Production
- No volumes (all code in image)
- Use external volumes for data persistence (future)

## Best Practices

1. Use `.dockerignore` to exclude unnecessary files
2. Multi-stage builds for smaller images
3. Health checks for reliability
4. Environment variables for configuration
5. Separate dev/prod docker-compose files
