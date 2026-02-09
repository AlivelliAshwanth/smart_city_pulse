# City Pulse Live - Complete Project Documentation

## 📖 Table of Contents

1. [Project Overview](#project-overview)
2. [Data Sources](#data-sources)
3. [Machine Learning Models](#machine-learning-models)
4. [API Documentation](#api-documentation)
5. [IoT Integration](#iot-integration)
6. [Data Preprocessing](#data-preprocessing)
7. [Architecture](#architecture)
8. [Setup Guide](#setup-guide)

---

## Project Overview

City Pulse Live is a comprehensive IoT sensor monitoring platform for real-time environmental monitoring. It provides a digital twin interface for water quality and air quality sensors with advanced analytics, machine learning capabilities, and disaster simulation features.

**Key Features:**
- Real-time sensor monitoring (water & air quality)
- Interactive dashboard with maps, charts, and tables
- ML-based anomaly detection and forecasting
- IoT sensor integration (MQTT & HTTP)
- Data preprocessing and cleaning
- Disaster simulation scenarios
- WebSocket real-time updates

**Tech Stack:**
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- ML: Custom implementations (Isolation Forest, LSTM, Autoencoder)
- Protocols: MQTT, HTTP REST, WebSocket

---

## Data Sources

### 1. Simulated Data (Default)

**Location**: `backend/src/data/initialData.ts`

**Initial Configuration:**
- 5 Water Sensors: pH, turbidity, TDS, temperature
- 5 Air Sensors: PM2.5, CO₂, NO₂, humidity
- 5 Initial Alerts

**Update Mechanism:**
- Periodic updates every 3 seconds
- Random "jitter" applied to simulate realistic behavior
- Status automatically calculated based on thresholds

### 2. Real IoT Sensors

**Supported Protocols:**
- **MQTT**: Message Queuing Telemetry Transport
- **HTTP REST**: Direct POST requests

**Configuration:**
```env
IOT_MQTT_ENABLED=true
IOT_MQTT_BROKER_URL=mqtt://your-broker:1883
IOT_HTTP_ENABLED=true
```

**Data Flow:**
```
IoT Sensor → MQTT/HTTP → IoT Connector → Preprocessing → ML Analysis → Storage → WebSocket → Frontend
```

**See**: [DATA_SOURCES.md](./DATA_SOURCES.md) for complete details

---

## Machine Learning Models

### Implemented Algorithms

#### 1. **Isolation Forest** (Anomaly Detection)
- **Type**: Unsupervised Learning
- **Purpose**: Detect anomalies in sensor data
- **Method**: Isolation trees, path length scoring
- **Use Case**: Sensor malfunctions, unusual readings

#### 2. **Autoencoder** (Anomaly Detection)
- **Type**: Deep Learning (Neural Network)
- **Purpose**: Detect anomalies via reconstruction error
- **Method**: Encode-decode, measure reconstruction error
- **Use Case**: Complex patterns, sensor drift

#### 3. **LSTM** (Forecasting)
- **Type**: Deep Learning (RNN)
- **Purpose**: Time series forecasting
- **Method**: Long-term memory, sequential patterns
- **Use Case**: Predicting future sensor values

#### 4. **Linear Regression** (Prediction)
- **Type**: Supervised Learning
- **Purpose**: Trend prediction
- **Method**: y = mx + b, R-squared confidence
- **Use Case**: Short-term predictions

#### 5. **Exponential Smoothing** (Forecasting)
- **Type**: Time Series Analysis
- **Purpose**: Short-term forecasting
- **Method**: Weighted moving average
- **Use Case**: Smooth predictions, noise reduction

#### 6. **Ensemble Method** (Anomaly Detection)
- **Type**: Meta-Learning
- **Purpose**: Combine multiple methods
- **Method**: Weighted voting (Isolation Forest 60%, Autoencoder 40%)
- **Use Case**: Highest accuracy anomaly detection

**API Endpoints:**
- `POST /api/ml/anomaly-detect` - Detect anomalies
- `POST /api/ml/forecast` - Forecast future values
- `POST /api/ml/train` - Train models
- `GET /api/ml/model-metrics/:sensorId/:fieldName` - Get metrics

**See**: [ML_MODELS.md](./ML_MODELS.md) for complete details

---

## API Documentation

### Core Endpoints

**Sensors:**
- `GET /api/sensors/water` - All water sensors
- `GET /api/sensors/air` - All air sensors
- `GET /api/sensors/:id` - Specific sensor

**Alerts:**
- `GET /api/alerts` - All alerts (with filters)
- `GET /api/alerts/:id` - Specific alert

**Simulation:**
- `POST /api/simulation/start` - Start simulation
- `POST /api/simulation/stop` - Stop simulation
- `GET /api/simulation/status` - Get status

**Analytics:**
- `GET /api/analytics/pm25` - PM2.5 time series
- `GET /api/analytics/ph` - pH time series
- `GET /api/analytics/co2` - CO₂ time series
- `GET /api/analytics/turbidity` - Turbidity time series

**IoT:**
- `POST /api/iot/data` - Receive sensor data
- `POST /api/iot/register` - Register sensor
- `GET /api/iot/sensors` - List sensors

**Data Quality:**
- `GET /api/data-quality/:sensorId` - Quality metrics
- `POST /api/data-quality/preprocess` - Test preprocessing

**Machine Learning:**
- `POST /api/ml/anomaly-detect` - Detect anomalies
- `POST /api/ml/forecast` - Forecast values
- `POST /api/ml/train` - Train model

**See**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete reference

---

## IoT Integration

### MQTT Integration

**Configuration:**
```env
IOT_MQTT_ENABLED=true
IOT_MQTT_BROKER_URL=mqtt://broker-url:1883
IOT_MQTT_TOPIC_WATER=sensors/water/+
IOT_MQTT_TOPIC_AIR=sensors/air/+
```

**Message Format:**
```json
{
  "sensorId": "w1",
  "type": "water",
  "data": {
    "ph": 7.2,
    "turbidity": 12
  },
  "location": {
    "lat": 28.6139,
    "lng": 77.2090
  }
}
```

### HTTP Integration

**Endpoint**: `POST /api/iot/data`

**Same message format as MQTT**

**See**: [IOT_INTEGRATION.md](./IOT_INTEGRATION.md) for complete guide

---

## Data Preprocessing

### Preprocessing Pipeline

1. **Validation**
   - Range checking
   - NaN/Infinity detection
   - Type validation

2. **Outlier Detection**
   - Z-score method (>3 std dev)
   - IQR method (1.5 * IQR)
   - Sudden change detection (>50%)

3. **Cleaning**
   - Clamp out-of-range values
   - Replace NaN with previous/default
   - Apply weighted average for outliers

4. **Smoothing**
   - Moving average filter (window: 5)
   - Reduces noise
   - Maintains trends

5. **Missing Values**
   - Interpolation
   - Previous value fallback
   - Default values

**Quality Metrics:**
- Quality Score: 0-100
- Outlier count
- Missing fields
- Anomaly count

**See**: [DATA_PREPROCESSING.md](./DATA_PREPROCESSING.md) for complete details

---

## Architecture

### System Architecture

```
IoT Sensors → IoT Connector → Data Preprocessor → ML Service → Sensor Service → REST API / WebSocket → Frontend
```

### Component Layers

1. **Client Layer**: React frontend, mobile apps (future)
2. **Application Layer**: Express server, WebSocket server
3. **Service Layer**: Sensor service, IoT connector, ML service, preprocessor
4. **Data Layer**: In-memory storage (database future)
5. **External Layer**: MQTT broker, HTTP sensors

### Design Patterns

- Service Layer Pattern
- Repository Pattern (future)
- Observer Pattern (WebSocket)
- Strategy Pattern (ML algorithms)
- Factory Pattern (connectors)

**See**: [ARCHITECTURE.md](./ARCHITECTURE.md) for complete architecture details

---

## Setup Guide

### Quick Start

1. **Install Dependencies**
```bash
npm install
cd backend && npm install && cd ..
```

2. **Configure Environment**
```bash
# Frontend .env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3002

# Backend .env (optional)
PORT=3001
WS_PORT=3002
```

3. **Start Backend**
```bash
cd backend
npm run dev
```

4. **Start Frontend**
```bash
npm run dev
```

5. **Access Application**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:3002

**See**: [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete setup instructions

---

## Data Models

### Water Sensor
```typescript
{
  id: string;
  name: string;
  lat: number;
  lng: number;
  ph: number;              // 0-14
  turbidity: number;      // NTU
  tds: number;            // ppm
  temperature: number;    // Celsius
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: string;
}
```

### Air Sensor
```typescript
{
  id: string;
  name: string;
  lat: number;
  lng: number;
  pm25: number;           // µg/m³
  co2: number;            // ppm
  no2: number;            // ppb
  humidity: number;       // 0-100%
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: string;
}
```

### Alert
```typescript
{
  id: string;
  type: 'water' | 'air';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  sensorId: string;
  timestamp: string;
}
```

---

## Key Features Summary

### ✅ Implemented Features

1. **Real-time Monitoring**
   - WebSocket updates every 3 seconds
   - Interactive dashboard
   - Live maps and charts

2. **IoT Integration**
   - MQTT support
   - HTTP REST API
   - Auto-registration
   - Sensor management

3. **Machine Learning**
   - 6 ML algorithms
   - Anomaly detection
   - Time series forecasting
   - Ensemble methods

4. **Data Processing**
   - Validation and cleaning
   - Outlier detection
   - Missing value handling
   - Quality scoring

5. **Alert System**
   - Automatic alerts
   - ML-based detection
   - Multi-severity levels
   - Real-time notifications

6. **Simulation**
   - Pollution scenarios
   - Flood simulation
   - Contamination testing
   - Adjustable speed

---

## File Structure

```
city-pulse-live-main/
├── docs/                    # Complete documentation
│   ├── README.md
│   ├── PROJECT_OVERVIEW.md
│   ├── DATA_SOURCES.md
│   ├── ML_MODELS.md
│   ├── API_DOCUMENTATION.md
│   ├── IOT_INTEGRATION.md
│   ├── DATA_PREPROCESSING.md
│   ├── SETUP_GUIDE.md
│   ├── ARCHITECTURE.md
│   └── COMPLETE_PROJECT_DOCUMENTATION.md
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── data/           # Initial data
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   │   ├── sensorService.ts
│   │   │   ├── iotConnector.ts
│   │   │   ├── mlService.ts
│   │   │   ├── dataPreprocessor.ts
│   │   │   └── sensorRegistry.ts
│   │   ├── types.ts
│   │   ├── utils/
│   │   └── server.ts
│   └── package.json
├── src/                     # Frontend
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   └── pages/
└── package.json
```

---

## Quick Reference

### Data Sources
- **Simulated**: `backend/src/data/initialData.ts`
- **Real IoT**: MQTT topics or HTTP endpoint
- **Update Frequency**: 3 seconds (simulated), real-time (IoT)

### ML Models
- **Anomaly Detection**: Isolation Forest, Autoencoder, Ensemble
- **Forecasting**: LSTM, Linear Regression, Exponential Smoothing
- **API**: `/api/ml/anomaly-detect`, `/api/ml/forecast`

### API Base URLs
- **REST API**: `http://localhost:3001`
- **WebSocket**: `ws://localhost:3002`
- **Frontend**: `http://localhost:8080`

### Environment Variables
- **Frontend**: `VITE_API_URL`, `VITE_WS_URL`
- **Backend**: `PORT`, `WS_PORT`, `IOT_MQTT_*`, `IOT_HTTP_*`

---

## Documentation Files

| File | Description |
|------|-------------|
| [README.md](./README.md) | Documentation index |
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | Complete project overview |
| [DATA_SOURCES.md](./DATA_SOURCES.md) | Data sources and flow |
| [ML_MODELS.md](./ML_MODELS.md) | ML algorithms documentation |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Complete API reference |
| [IOT_INTEGRATION.md](./IOT_INTEGRATION.md) | IoT sensor integration guide |
| [DATA_PREPROCESSING.md](./DATA_PREPROCESSING.md) | Data cleaning and preprocessing |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Installation and setup |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture |
| [QNA_100_QUESTIONS.md](./QNA_100_QUESTIONS.md) | **100+ Q&A for BTech Project Viva** |

---

## Support & Resources

- **Documentation**: All docs in `docs/` folder
- **API Reference**: See API_DOCUMENTATION.md
- **Examples**: See IOT_INTEGRATION.md for sensor code examples
- **Troubleshooting**: See SETUP_GUIDE.md

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
