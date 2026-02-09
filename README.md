# City Pulse Live

IoT sensor monitoring platform with real-time data visualization and simulation capabilities.

## Project Overview

City Pulse Live is a digital twin platform for monitoring city-wide IoT sensors including water quality and air quality sensors. The platform provides real-time updates via WebSocket, REST API endpoints, and disaster simulation scenarios.

## Features

- **Real-time Sensor Monitoring**: Water quality (pH, turbidity, TDS, temperature) and air quality (PM2.5, CO₂, NO₂, humidity)
- **Live Dashboard**: Interactive maps, charts, and tables
- **Alert System**: Automatic alerts for critical sensor conditions
- **Disaster Simulation**: Test scenarios for pollution spikes, floods, and contamination
- **WebSocket Support**: Real-time updates without polling
- **RESTful API**: Complete backend API for sensor data and analytics

## Tech Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- shadcn-ui components
- React Router
- Recharts for data visualization
- Leaflet for maps

### Backend
- Node.js + Express
- TypeScript
- WebSocket (ws)
- RESTful API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Two terminal windows (one for frontend, one for backend)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd city-pulse-live-main
```

2. **Install Frontend Dependencies**
```bash
npm install
```

3. **Install Backend Dependencies**
```bash
cd backend
npm install
cd ..
```

### Running the Application

#### Start the Backend Server

In the first terminal:
```bash
cd backend
npm run dev
```

The backend will start on:
- HTTP API: http://localhost:3001
- WebSocket: ws://localhost:3002

#### Start the Frontend

In the second terminal (from project root):
```bash
npm run dev
```

The frontend will start on http://localhost:8080

### Environment Variables

Create a `.env` file in the project root (optional, defaults are provided):

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3002
```

## API Documentation

### Sensors
- `GET /api/sensors/water` - Get all water sensors
- `GET /api/sensors/air` - Get all air sensors
- `GET /api/sensors/:id` - Get specific sensor by ID

### Alerts
- `GET /api/alerts` - Get all alerts

### Simulation
- `POST /api/simulation/start` - Start simulation
  ```json
  {
    "scenario": "pollution" | "flood" | "contamination",
    "speed": 1-10
  }
  ```
- `POST /api/simulation/stop` - Stop simulation and reset

### Analytics
- `GET /api/analytics/pm25` - PM2.5 time series
- `GET /api/analytics/ph` - pH time series
- `GET /api/analytics/co2` - CO₂ time series
- `GET /api/analytics/turbidity` - Turbidity time series

### Health
- `GET /health` - Health check

## WebSocket Events

The WebSocket server broadcasts:
- `sensor_update` - Real-time sensor data updates
- `alert` - New alert notifications
- `simulation_start` - Simulation started
- `simulation_stop` - Simulation stopped

## Project Structure

```
city-pulse-live-main/
├── backend/              # Backend API server
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── data/        # Initial data
│   │   └── server.ts    # Express server
│   └── package.json
├── src/                 # Frontend React app
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks
│   ├── services/       # API services
│   └── pages/          # Page components
└── package.json
```

## Development

### Backend Development
```bash
cd backend
npm run dev    # Development with hot reload
npm run build  # Build for production
npm start      # Run production build
```

### Frontend Development
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
npm run build
# Output in dist/ directory
```

## License

ISC
