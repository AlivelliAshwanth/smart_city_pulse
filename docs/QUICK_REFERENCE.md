# Quick Reference Guide

## 🚀 Quick Start

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
npm install && npm run dev
```

**Access**: http://localhost:8080

---

## 📍 Data Sources

### Simulated Data
- **Location**: `backend/src/data/initialData.ts`
- **Update**: Every 3 seconds
- **Sensors**: 5 water + 5 air sensors

### Real IoT Sensors
- **MQTT**: `mqtt://broker-url:1883` → Topics: `sensors/water/+`, `sensors/air/+`
- **HTTP**: `POST http://localhost:3001/api/iot/data`
- **Config**: Set `IOT_MQTT_ENABLED=true` or `IOT_HTTP_ENABLED=true`

---

## 🤖 ML Models Used

1. **Isolation Forest** - Anomaly Detection
2. **Autoencoder** - Anomaly Detection
3. **LSTM** - Forecasting
4. **Linear Regression** - Prediction
5. **Exponential Smoothing** - Forecasting
6. **Ensemble** - Combined Anomaly Detection

**API**: `POST /api/ml/anomaly-detect`, `POST /api/ml/forecast`

---

## 🔌 API Endpoints

### Core
- `GET /health` - Health check
- `GET /api/sensors/water` - Water sensors
- `GET /api/sensors/air` - Air sensors
- `GET /api/alerts` - Alerts

### IoT
- `POST /api/iot/data` - Receive sensor data
- `POST /api/iot/register` - Register sensor

### ML
- `POST /api/ml/anomaly-detect` - Detect anomalies
- `POST /api/ml/forecast` - Forecast values

### Simulation
- `POST /api/simulation/start` - Start simulation
- `POST /api/simulation/stop` - Stop simulation

**Base URL**: `http://localhost:3001`

---

## 📊 Sensor Data Format

### Water Sensor
```json
{
  "sensorId": "w1",
  "type": "water",
  "data": {
    "ph": 7.2,
    "turbidity": 12,
    "tds": 320,
    "temperature": 24.5
  }
}
```

### Air Sensor
```json
{
  "sensorId": "a1",
  "type": "air",
  "data": {
    "pm25": 45,
    "co2": 420,
    "no2": 28,
    "humidity": 55
  }
}
```

---

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3002
```

### Backend (.env)
```env
PORT=3001
WS_PORT=3002
IOT_MQTT_ENABLED=false
IOT_HTTP_ENABLED=true
```

---

## 📚 Documentation Files

- **[COMPLETE_PROJECT_DOCUMENTATION.md](./COMPLETE_PROJECT_DOCUMENTATION.md)** - Everything
- **[DATA_SOURCES.md](./DATA_SOURCES.md)** - Data sources
- **[ML_MODELS.md](./ML_MODELS.md)** - ML algorithms
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API reference
- **[IOT_INTEGRATION.md](./IOT_INTEGRATION.md)** - IoT setup
- **[DATA_PREPROCESSING.md](./DATA_PREPROCESSING.md)** - Data cleaning
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Setup instructions
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture

---

## 🎯 Common Tasks

**Connect Real Sensor**: See [IOT_INTEGRATION.md](./IOT_INTEGRATION.md)  
**Use ML Features**: See [ML_MODELS.md](./ML_MODELS.md)  
**API Integration**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)  
**Troubleshooting**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting)
