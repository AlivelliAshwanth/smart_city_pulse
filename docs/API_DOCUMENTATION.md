# API Documentation

Complete REST API reference for City Pulse Live backend.

## Base URL

```
http://localhost:3001
```

## Authentication

Currently, authentication is optional. For IoT endpoints, you can set `IOT_API_KEY` in environment variables.

## Endpoints

### Health Check

#### GET /health
Get server health status and metrics.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "sensors": {
    "water": 5,
    "air": 5
  }
}
```

---

### Sensors

#### GET /api/sensors/water
Get all water quality sensors.

**Response:**
```json
[
  {
    "id": "w1",
    "name": "Lake Aria – North",
    "lat": 28.6139,
    "lng": 77.2090,
    "ph": 7.2,
    "turbidity": 12,
    "tds": 320,
    "temperature": 24.5,
    "status": "normal",
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
]
```

#### GET /api/sensors/air
Get all air quality sensors.

**Response:** Similar to water sensors with air-specific fields (pm25, co2, no2, humidity)

#### GET /api/sensors
Get all sensors (both water and air).

**Response:**
```json
{
  "water": [...],
  "air": [...]
}
```

#### GET /api/sensors/:id
Get specific sensor by ID.

**Parameters:**
- `id` (path): Sensor ID

**Response:**
```json
{
  "id": "w1",
  "name": "Lake Aria – North",
  ...
}
```

---

### Alerts

#### GET /api/alerts
Get all alerts with optional filtering.

**Query Parameters:**
- `severity` (optional): Filter by severity (`info`, `warning`, `critical`)
- `type` (optional): Filter by type (`water`, `air`)
- `limit` (optional): Limit number of results

**Example:**
```
GET /api/alerts?severity=critical&type=air&limit=10
```

**Response:**
```json
[
  {
    "id": "al1",
    "type": "water",
    "severity": "critical",
    "message": "pH level critically low at River Bend Station",
    "sensorId": "w2",
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

#### GET /api/alerts/:id
Get specific alert by ID.

---

### Simulation

#### POST /api/simulation/start
Start a disaster simulation scenario.

**Request Body:**
```json
{
  "scenario": "pollution" | "flood" | "contamination",
  "speed": 1-10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Simulation pollution started with speed 5x",
  "scenario": "pollution",
  "speed": 5
}
```

#### POST /api/simulation/stop
Stop simulation and reset sensors.

**Response:**
```json
{
  "success": true,
  "message": "Simulation stopped and sensors reset"
}
```

#### GET /api/simulation/status
Get current simulation status.

**Response:**
```json
{
  "active": true,
  "scenario": "pollution",
  "speed": 5
}
```

---

### Analytics

#### GET /api/analytics/pm25
Get PM2.5 time series data (24 hours).

**Response:**
```json
[
  {
    "time": "00:00",
    "value": 45.2
  },
  ...
]
```

#### GET /api/analytics/ph
Get pH time series data.

#### GET /api/analytics/co2
Get CO₂ time series data.

#### GET /api/analytics/turbidity
Get turbidity time series data.

---

### IoT Integration

#### POST /api/iot/data
Receive sensor data from IoT devices.

**Request Body:**
```json
{
  "sensorId": "w1",
  "type": "water",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "ph": 7.2,
    "turbidity": 12,
    "tds": 320,
    "temperature": 24.5
  },
  "location": {
    "lat": 28.6139,
    "lng": 77.2090
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sensor data received",
  "sensorId": "w1"
}
```

#### POST /api/iot/register
Register a new IoT sensor.

**Request Body:**
```json
{
  "id": "w1",
  "name": "Lake Aria – North",
  "type": "water",
  "lat": 28.6139,
  "lng": 77.2090,
  "metadata": {
    "manufacturer": "Acme Sensors",
    "model": "WS-2024"
  }
}
```

#### GET /api/iot/sensors
Get all registered IoT sensors.

**Query Parameters:**
- `type` (optional): Filter by type (`water`, `air`)

#### GET /api/iot/sensors/:id
Get specific registered sensor.

#### PUT /api/iot/sensors/:id/enable
Enable/disable a sensor.

**Request Body:**
```json
{
  "enabled": true
}
```

#### DELETE /api/iot/sensors/:id
Unregister a sensor.

---

### Data Quality

#### GET /api/data-quality/:sensorId
Get data quality metrics for a sensor.

**Response:**
```json
{
  "sensorId": "w1",
  "metrics": {
    "isValid": true,
    "outliers": 0,
    "missingFields": [],
    "anomalies": [],
    "qualityScore": 95
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### POST /api/data-quality/preprocess
Test preprocessing on sample data.

**Request Body:**
```json
{
  "sensorId": "w1",
  "type": "water",
  "data": {
    "ph": 7.2,
    "turbidity": 12
  }
}
```

---

### Machine Learning

#### POST /api/ml/anomaly-detect
Detect anomalies using ML algorithms.

**Request Body:**
```json
{
  "sensorId": "w1",
  "fieldName": "ph",
  "value": 5.2,
  "method": "ensemble"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "isAnomaly": true,
    "score": 0.85,
    "reason": "Ensemble score 0.850",
    "method": "ensemble"
  }
}
```

#### POST /api/ml/forecast
Forecast future sensor values.

**Request Body:**
```json
{
  "sensorId": "a1",
  "fieldName": "pm25",
  "method": "lstm"
}
```

**Response:**
```json
{
  "success": true,
  "forecast": {
    "predictions": [
      {
        "time": "2024-01-15T11:00:00Z",
        "value": 48.5,
        "confidence": 0.9
      }
    ],
    "method": "lstm",
    "horizon": 6
  }
}
```

#### POST /api/ml/train
Train ML model for a sensor field.

**Request Body:**
```json
{
  "sensorId": "w1",
  "fieldName": "ph"
}
```

#### GET /api/ml/model-metrics/:sensorId/:fieldName
Get ML model performance metrics.

---

## WebSocket API

### Connection
```
ws://localhost:3002
```

### Message Types

#### sensor_update
```json
{
  "type": "sensor_update",
  "data": {
    "type": "water",
    "sensor": {
      "id": "w1",
      "ph": 7.2,
      ...
    }
  }
}
```

#### alert
```json
{
  "type": "alert",
  "data": {
    "alert": {
      "id": "al1",
      "severity": "critical",
      "message": "...",
      ...
    }
  }
}
```

#### simulation_start
```json
{
  "type": "simulation_start",
  "data": {
    "id": "pollution",
    "label": "Pollution",
    "active": true,
    "speed": 5
  }
}
```

#### simulation_stop
```json
{
  "type": "simulation_stop"
}
```

#### initial_data
Sent on WebSocket connection:
```json
{
  "type": "initial_data",
  "data": {
    "water": [...],
    "air": [...],
    "alerts": [...]
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently not implemented. Can be added for production use.

## CORS

CORS is enabled for all origins by default. Configure via `FRONTEND_URL` environment variable.
