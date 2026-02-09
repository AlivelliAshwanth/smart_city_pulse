# City Pulse Live - Documentation Index

## 📚 Complete Documentation Guide

All project documentation is consolidated in this `docs/` folder. This index helps you navigate to the information you need.

---

## 🚀 Quick Start

**New to the project?** Start here:
1. [COMPLETE_PROJECT_DOCUMENTATION.md](./COMPLETE_PROJECT_DOCUMENTATION.md) - Everything in one place
2. [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Get up and running
3. [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Understand the project

---

## 📖 Documentation Files

### Core Documentation

| File | Description | When to Read |
|------|-------------|--------------|
| **[COMPLETE_PROJECT_DOCUMENTATION.md](./COMPLETE_PROJECT_DOCUMENTATION.md)** | Master documentation covering everything | Start here for overview |
| **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** | Project introduction, features, tech stack | Understanding the project |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | System architecture, design patterns | Understanding system design |
| **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** | Installation and setup instructions | Setting up the project |

### Data & Models

| File | Description | When to Read |
|------|-------------|--------------|
| **[DATA_SOURCES.md](./DATA_SOURCES.md)** | Where data comes from (simulated vs real IoT) | Understanding data flow |
| **[ML_MODELS.md](./ML_MODELS.md)** | Machine learning algorithms used | Using ML features |
| **[DATA_PREPROCESSING.md](./DATA_PREPROCESSING.md)** | Data cleaning and validation | Understanding data quality |

### Integration & API

| File | Description | When to Read |
|------|-------------|--------------|
| **[IOT_INTEGRATION.md](./IOT_INTEGRATION.md)** | Connecting real IoT sensors | Integrating sensors |
| **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** | Complete API reference | Using the API |

---

## 🔍 Find Information By Topic

### Data Sources
- **Where data comes from**: [DATA_SOURCES.md](./DATA_SOURCES.md)
- **Simulated data**: [DATA_SOURCES.md#simulated-data-default](./DATA_SOURCES.md#1-simulated-data-default)
- **Real IoT sensors**: [DATA_SOURCES.md#real-iot-sensors](./DATA_SOURCES.md#2-real-iot-sensors)
- **Data flow**: [DATA_SOURCES.md#data-flow-diagram](./DATA_SOURCES.md#data-flow-diagram)

### Machine Learning
- **All ML algorithms**: [ML_MODELS.md](./ML_MODELS.md)
- **Anomaly detection**: [ML_MODELS.md#isolation-forest-anomaly-detection](./ML_MODELS.md#1-isolation-forest-anomaly-detection)
- **Forecasting**: [ML_MODELS.md#lstm-long-short-term-memory-forecasting](./ML_MODELS.md#3-lstm-long-short-term-memory-forecasting)
- **ML API**: [API_DOCUMENTATION.md#machine-learning](./API_DOCUMENTATION.md#machine-learning)

### IoT Integration
- **MQTT setup**: [IOT_INTEGRATION.md#mqtt-integration](./IOT_INTEGRATION.md#mqtt-integration)
- **HTTP integration**: [IOT_INTEGRATION.md#http-rest-api-integration](./IOT_INTEGRATION.md#http-rest-api-integration)
- **Sensor registration**: [IOT_INTEGRATION.md#sensor-registration](./IOT_INTEGRATION.md#sensor-registration)
- **Code examples**: [IOT_INTEGRATION.md#example-arduinoesp32-code](./IOT_INTEGRATION.md#example-arduinoesp32-code)

### Data Processing
- **Preprocessing steps**: [DATA_PREPROCESSING.md#preprocessing-steps](./DATA_PREPROCESSING.md#preprocessing-steps)
- **Validation**: [DATA_PREPROCESSING.md#step-1-validation](./DATA_PREPROCESSING.md#step-1-validation)
- **Cleaning**: [DATA_PREPROCESSING.md#step-3-cleaning](./DATA_PREPROCESSING.md#step-3-cleaning)
- **Quality metrics**: [DATA_PREPROCESSING.md#data-quality-scoring](./DATA_PREPROCESSING.md#data-quality-scoring)

### API Usage
- **All endpoints**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Sensors API**: [API_DOCUMENTATION.md#sensors](./API_DOCUMENTATION.md#sensors)
- **ML API**: [API_DOCUMENTATION.md#machine-learning](./API_DOCUMENTATION.md#machine-learning)
- **WebSocket**: [API_DOCUMENTATION.md#websocket-api](./API_DOCUMENTATION.md#websocket-api)

### Architecture
- **System architecture**: [ARCHITECTURE.md#architecture-diagram](./ARCHITECTURE.md#architecture-diagram)
- **Data flow**: [ARCHITECTURE.md#data-flow](./ARCHITECTURE.md#data-flow)
- **Design patterns**: [ARCHITECTURE.md#design-patterns](./ARCHITECTURE.md#design-patterns)
- **Scalability**: [ARCHITECTURE.md#scalability-considerations](./ARCHITECTURE.md#scalability-considerations)

---

## 📊 Key Information Summary

### Data Sources
- **Simulated**: Hardcoded in `backend/src/data/initialData.ts`
- **Real IoT**: MQTT broker or HTTP endpoint
- **Update Frequency**: 3 seconds (simulated), real-time (IoT)

### ML Models Used
1. Isolation Forest - Anomaly Detection
2. Autoencoder - Anomaly Detection  
3. LSTM - Forecasting
4. Linear Regression - Prediction
5. Exponential Smoothing - Forecasting
6. Ensemble Method - Combined Anomaly Detection

### API Base URLs
- REST API: `http://localhost:3001`
- WebSocket: `ws://localhost:3002`
- Frontend: `http://localhost:8080`

### Sensor Types
- **Water**: pH, turbidity, TDS, temperature
- **Air**: PM2.5, CO₂, NO₂, humidity

---

## 🎯 Common Tasks

### Setting Up the Project
→ [SETUP_GUIDE.md](./SETUP_GUIDE.md)

### Connecting Real Sensors
→ [IOT_INTEGRATION.md](./IOT_INTEGRATION.md)

### Using ML Features
→ [ML_MODELS.md](./ML_MODELS.md)

### Understanding Data Flow
→ [DATA_SOURCES.md](./DATA_SOURCES.md)

### API Integration
→ [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Understanding Architecture
→ [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 📝 Documentation Structure

```
docs/
├── README.md                          # This file - documentation index
├── INDEX.md                           # Alternative index (this file)
├── COMPLETE_PROJECT_DOCUMENTATION.md  # Master documentation
├── PROJECT_OVERVIEW.md               # Project introduction
├── DATA_SOURCES.md                    # Data sources and flow
├── ML_MODELS.md                       # ML algorithms
├── API_DOCUMENTATION.md               # API reference
├── IOT_INTEGRATION.md                 # IoT sensor integration
├── DATA_PREPROCESSING.md              # Data cleaning
├── SETUP_GUIDE.md                     # Setup instructions
└── ARCHITECTURE.md                    # System architecture
```

---

## 🔗 External Resources

- **Node.js**: https://nodejs.org/
- **React**: https://react.dev/
- **Express**: https://expressjs.com/
- **MQTT**: https://mqtt.org/
- **TypeScript**: https://www.typescriptlang.org/

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0
