# Setup Guide

Complete setup instructions for City Pulse Live.

## Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Git**: For cloning the repository
- **Two Terminal Windows**: One for backend, one for frontend

## Installation Steps

### 1. Clone Repository

```bash
git clone <repository-url>
cd city-pulse-live-main
```

### 2. Install Frontend Dependencies

```bash
npm install
```

This installs:
- React and dependencies
- Vite build tool
- Tailwind CSS
- UI components
- Chart libraries
- Map libraries

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

This installs:
- Express.js
- WebSocket library
- MQTT client
- TypeScript
- Development tools

### 4. Configure Environment Variables

#### Frontend Configuration

Create `.env` in project root:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3002
```

#### Backend Configuration

Create `.env` in `backend/` folder:

```env
# Server Configuration
PORT=3001
WS_PORT=3002
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080

# IoT Configuration (Optional)
IOT_MQTT_ENABLED=false
IOT_MQTT_BROKER_URL=mqtt://localhost:1883
IOT_MQTT_USERNAME=
IOT_MQTT_PASSWORD=
IOT_MQTT_TOPIC_WATER=sensors/water/+
IOT_MQTT_TOPIC_AIR=sensors/air/+

IOT_HTTP_ENABLED=true
IOT_API_KEY=
```

## Running the Application

### Development Mode

#### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3001
📡 WebSocket server running on ws://localhost:3002
📊 Health check: http://localhost:3001/health
```

#### Terminal 2: Frontend Server

```bash
npm run dev
```

You should see:
```
VITE v5.4.19  ready in 2892 ms
➜  Local:   http://localhost:8080/
```

### Production Mode

#### Build Backend

```bash
cd backend
npm run build
npm start
```

#### Build Frontend

```bash
npm run build
npm run preview
```

## Verifying Installation

### 1. Check Backend Health

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...,
  "sensors": {
    "water": 5,
    "air": 5
  }
}
```

### 2. Check Frontend

Open browser: `http://localhost:8080`

You should see the dashboard with:
- Sensor map
- Real-time sensor data
- Charts and tables
- Alert feed

### 3. Test API Endpoints

```bash
# Get water sensors
curl http://localhost:3001/api/sensors/water

# Get air sensors
curl http://localhost:3001/api/sensors/air

# Get alerts
curl http://localhost:3001/api/alerts
```

## Troubleshooting

### Backend Won't Start

**Issue**: Port already in use
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill
```

**Issue**: Missing dependencies
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend Won't Start

**Issue**: Port 8080 in use
- Change port in `vite.config.ts` or kill process using port 8080

**Issue**: Cannot connect to backend
- Verify backend is running on port 3001
- Check `VITE_API_URL` in `.env`

### WebSocket Connection Failed

**Issue**: WebSocket not connecting
- Verify backend WebSocket server is running on port 3002
- Check `VITE_WS_URL` in `.env`
- Check browser console for errors

### No Data Showing

**Issue**: Empty dashboard
- Check browser console for errors
- Verify backend API is responding
- Check WebSocket connection status
- Verify sensors are initialized

## Development Tools

### Backend Development

```bash
cd backend
npm run dev      # Development with hot reload
npm run build    # Build for production
npm start        # Run production build
npm run type-check  # Type checking
```

### Frontend Development

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Lint code
```

## IDE Setup

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- React snippets

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Docker Setup (Optional)

### Dockerfile Example

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN npm run build
EXPOSE 3001 3002
CMD ["npm", "start"]
```

## Next Steps

1. **Configure IoT Sensors**: See [IOT_INTEGRATION.md](./IOT_INTEGRATION.md)
2. **Explore ML Features**: See [ML_MODELS.md](./ML_MODELS.md)
3. **Understand Data Flow**: See [DATA_SOURCES.md](./DATA_SOURCES.md)
4. **API Reference**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Support

For issues or questions:
1. Check documentation in `docs/` folder
2. Review error logs in console
3. Check GitHub issues (if applicable)
