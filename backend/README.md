# City Pulse Backend API

Backend server for City Pulse Live - IoT sensor monitoring platform.

## Features

- REST API for sensor data, alerts, and analytics
- WebSocket support for real-time sensor updates
- Simulation scenarios (pollution spike, flood, contamination)
- Automatic sensor status calculation based on thresholds
- Alert generation for critical conditions

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The server will start on:
- HTTP API: http://localhost:3001
- WebSocket: ws://localhost:3002

## API Endpoints

### Sensors
- `GET /api/sensors/water` - Get all water sensors
- `GET /api/sensors/air` - Get all air sensors
- `GET /api/sensors/:id` - Get specific sensor by ID

### Alerts
- `GET /api/alerts` - Get all alerts

### Simulation
- `POST /api/simulation/start` - Start simulation scenario
  ```json
  {
    "scenario": "pollution" | "flood" | "contamination",
    "speed": 1-10
  }
  ```
- `POST /api/simulation/stop` - Stop simulation and reset sensors

### Analytics
- `GET /api/analytics/pm25` - Get PM2.5 time series data
- `GET /api/analytics/ph` - Get pH time series data
- `GET /api/analytics/co2` - Get CO2 time series data
- `GET /api/analytics/turbidity` - Get turbidity time series data

### Health
- `GET /health` - Health check endpoint

## WebSocket Messages

The WebSocket server broadcasts the following message types:

```typescript
// Sensor update
{
  type: 'sensor_update',
  data: {
    type: 'water' | 'air',
    sensor: WaterSensor | AirSensor
  }
}

// Alert
{
  type: 'alert',
  data: {
    alert: Alert
  }
}

// Simulation start
{
  type: 'simulation_start',
  data: {
    id: string,
    label: string,
    description: string,
    active: boolean,
    speed: number
  }
}

// Simulation stop
{
  type: 'simulation_stop'
}
```

## Build

```bash
npm run build
npm start
```
