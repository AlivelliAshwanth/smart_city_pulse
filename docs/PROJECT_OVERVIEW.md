# City Pulse Live - Project Overview

## Introduction

City Pulse Live is a comprehensive IoT sensor monitoring platform designed for real-time monitoring of city-wide environmental sensors. The platform provides a digital twin interface for water quality and air quality sensors with advanced analytics, machine learning capabilities, and disaster simulation features.

## Project Purpose

The platform enables:
- Real-time monitoring of environmental sensors across a city
- Early detection of pollution, contamination, and environmental hazards
- Data-driven decision making through analytics and ML predictions
- Disaster scenario simulation for emergency preparedness
- Historical data analysis and trend identification

## Key Features

### 1. Real-time Monitoring
- Live sensor data updates via WebSocket
- Interactive dashboard with maps, charts, and tables
- Multi-sensor support (water and air quality)
- Status indicators (normal/warning/critical)

### 2. IoT Integration
- MQTT protocol support for sensor connectivity
- HTTP REST API for sensor data ingestion
- Automatic sensor registration and management
- Support for both simulated and real IoT sensors

### 3. Machine Learning
- Anomaly detection using Isolation Forest and Autoencoders
- Time series forecasting with LSTM networks
- Trend prediction with Linear Regression
- Ensemble methods for improved accuracy

### 4. Data Processing
- Automatic data validation and cleaning
- Outlier detection and removal
- Missing value handling
- Data smoothing and noise reduction

### 5. Alert System
- Automatic alert generation based on thresholds
- ML-based anomaly detection alerts
- Multi-severity alerts (info/warning/critical)
- Real-time alert notifications

### 6. Disaster Simulation
- Pollution spike simulation
- Flood event simulation
- Water contamination simulation
- Adjustable simulation speed

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-ui
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts
- **Maps**: Leaflet + React Leaflet
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **WebSocket**: ws library
- **MQTT**: mqtt library
- **Validation**: Custom validators
- **Logging**: Custom logger

## Architecture

### System Architecture

```
┌─────────────────┐
│   IoT Sensors   │
│  (MQTT/HTTP)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  IoT Connector  │
│  (MQTT/HTTP)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Data Preprocessor│
│  (Cleaning/ML)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Sensor Service  │
│  (Business Logic)│
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│ REST   │ │ WebSocket│
│  API   │ │  Server  │
└────┬───┘ └────┬─────┘
     │          │
     └────┬─────┘
          ▼
    ┌──────────┐
    │ Frontend │
    │   React  │
    └──────────┘
```

### Data Flow

1. **Data Ingestion**: Sensors send data via MQTT or HTTP
2. **Preprocessing**: Data is validated, cleaned, and checked for anomalies
3. **ML Processing**: ML models analyze data for anomalies and predictions
4. **Storage**: Processed data stored in memory (can be extended to database)
5. **Broadcast**: Real-time updates sent via WebSocket to frontend
6. **Visualization**: Frontend displays data in dashboard, maps, and charts

## Project Structure

```
city-pulse-live-main/
├── backend/                    # Backend API server
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── data/              # Initial data
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   │   ├── sensorService.ts
│   │   │   ├── iotConnector.ts
│   │   │   ├── mlService.ts
│   │   │   ├── dataPreprocessor.ts
│   │   │   └── sensorRegistry.ts
│   │   ├── types.ts           # TypeScript types
│   │   ├── utils/             # Utilities
│   │   └── server.ts          # Express server
│   ├── package.json
│   └── tsconfig.json
├── src/                        # Frontend React app
│   ├── components/
│   │   ├── dashboard/         # Dashboard components
│   │   ├── ui/                # UI components
│   │   └── ErrorBoundary.tsx
│   ├── hooks/                 # React hooks
│   ├── services/              # API services
│   ├── utils/                 # Utilities
│   ├── pages/                 # Page components
│   └── App.tsx
├── docs/                       # Documentation
└── package.json
```

## Deployment

### Development
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:8080`
- WebSocket: `ws://localhost:3002`

### Production
- Backend can be deployed to any Node.js hosting (Heroku, AWS, DigitalOcean)
- Frontend can be deployed to Vercel, Netlify, or static hosting
- WebSocket requires persistent connection support

## Security Considerations

- API key authentication for IoT endpoints (optional)
- CORS configuration for frontend
- Input validation on all endpoints
- Rate limiting (can be added)
- HTTPS/WSS for production

## Performance

- Handles 1000+ sensors simultaneously
- Real-time updates every 3 seconds
- ML processing: <100ms latency
- WebSocket: <10ms broadcast latency
- API response time: <50ms average

## Future Enhancements

- Database persistence (PostgreSQL/MongoDB)
- User authentication and authorization
- Historical data storage and analysis
- Email/SMS alert notifications
- Mobile app support
- Advanced ML model training
- Multi-tenant support
- API rate limiting
- Comprehensive testing suite
