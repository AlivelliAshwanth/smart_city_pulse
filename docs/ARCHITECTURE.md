# System Architecture

## Overview

City Pulse Live follows a microservices-inspired architecture with clear separation between frontend, backend, and data processing layers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Browser    │  │  Mobile App   │  │  API Client  │    │
│  │   (React)    │  │   (Future)    │  │   (Future)   │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │            │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
          ┌──────────────────▼──────────────────┐
          │      API GATEWAY / LOAD BALANCER    │
          │         (Future Enhancement)        │
          └──────────────────┬──────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                    APPLICATION LAYER                      │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────┐      │
│  │           Express.js Server                   │      │
│  │  - REST API Routes                            │      │
│  │  - Request Validation                         │      │
│  │  - Error Handling                            │      │
│  │  - CORS Middleware                           │      │
│  └──────────────────┬───────────────────────────┘      │
│                     │                                     │
│  ┌──────────────────▼───────────────────────────┐      │
│  │         WebSocket Server                      │      │
│  │  - Real-time Updates                         │      │
│  │  - Client Management                         │      │
│  │  - Message Broadcasting                      │      │
│  └──────────────────┬───────────────────────────┘      │
│                     │                                     │
└─────────────────────┼─────────────────────────────────────┘
                      │
┌─────────────────────▼─────────────────────────────────────┐
│                    SERVICE LAYER                           │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Sensor     │  │      IoT     │  │      ML      │   │
│  │   Service    │  │   Connector  │  │   Service    │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                  │                  │           │
│  ┌──────▼──────────────────▼──────────────────▼───────┐  │
│  │         Data Preprocessor Service                  │  │
│  │  - Validation                                      │  │
│  │  - Cleaning                                        │  │
│  │  - Outlier Detection                              │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Sensor Registry Service                    │  │
│  │  - Sensor Registration                            │  │
│  │  - Metadata Management                           │  │
│  │  - Health Monitoring                             │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
└─────────────────────┬─────────────────────────────────────┘
                      │
┌─────────────────────▼─────────────────────────────────────┐
│                    DATA LAYER                              │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  In-Memory   │  │   Database   │  │   File      │   │
│  │   Storage    │  │  (Future)    │  │  Storage    │   │
│  │              │  │              │  │  (Future)   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                           │
└───────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼─────────────────────────────────────┐
│                  EXTERNAL LAYER                            │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   MQTT       │  │     HTTP     │  │   External   │   │
│  │   Broker     │  │   Sensors    │  │    APIs      │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend Architecture

```
React App
├── App.tsx (Root)
│   ├── ErrorBoundary
│   ├── QueryClientProvider
│   └── Router
│       ├── Index Page
│       │   ├── DashboardSidebar
│       │   ├── DashboardHeader
│       │   └── Content Area
│       │       ├── OverviewTab
│       │       ├── CityMap
│       │       ├── SensorTable
│       │       ├── SensorChart
│       │       ├── AlertFeed
│       │       └── SimulationPanel
│       └── NotFound Page
├── Hooks
│   └── useSensorData (Data fetching + WebSocket)
├── Services
│   └── API clients
└── Utils
    └── API helpers
```

### Backend Architecture

```
Express Server
├── Middleware
│   ├── CORS
│   ├── JSON Parser
│   ├── Request Logger
│   ├── Error Handler
│   └── Validator
├── Routes
│   ├── /api/sensors
│   ├── /api/alerts
│   ├── /api/simulation
│   ├── /api/analytics
│   ├── /api/iot
│   ├── /api/data-quality
│   └── /api/ml
├── Services
│   ├── SensorService (Core business logic)
│   ├── IoTConnector (MQTT/HTTP)
│   ├── MLService (ML algorithms)
│   ├── DataPreprocessor (Cleaning)
│   └── SensorRegistry (Management)
└── WebSocket Server
    └── Real-time broadcasting
```

## Data Flow

### Sensor Data Flow

```
IoT Sensor
    │
    ├─[MQTT]─→ MQTT Broker ─→ IoT Connector
    │
    └─[HTTP]─→ HTTP Endpoint ─→ IoT Connector
                    │
                    ▼
            Data Preprocessor
                    │
                    ├─→ Validation
                    ├─→ Cleaning
                    └─→ Outlier Detection
                    │
                    ▼
            ML Service
                    │
                    ├─→ Anomaly Detection
                    └─→ Forecasting
                    │
                    ▼
            Sensor Service
                    │
                    ├─→ Status Calculation
                    ├─→ Alert Generation
                    └─→ Storage
                    │
                    ├─→ REST API
                    └─→ WebSocket ─→ Frontend
```

### Request Flow

```
Client Request
    │
    ▼
Express Middleware
    ├─→ CORS Check
    ├─→ Authentication (Future)
    ├─→ Validation
    └─→ Rate Limiting (Future)
    │
    ▼
Route Handler
    │
    ▼
Service Layer
    ├─→ Business Logic
    ├─→ Data Processing
    └─→ ML Processing
    │
    ▼
Response
    ├─→ Success Response
    └─→ Error Handler (if error)
```

## Design Patterns

### 1. Service Layer Pattern
- Business logic separated from routes
- Services are reusable and testable
- Clear separation of concerns

### 2. Repository Pattern (Future)
- Data access abstraction
- Easy to switch storage backends
- Currently using in-memory storage

### 3. Observer Pattern
- WebSocket broadcasting
- Event-driven updates
- Decoupled components

### 4. Strategy Pattern
- Multiple ML algorithms
- Pluggable preprocessing methods
- Configurable validation rules

### 5. Factory Pattern
- IoT connector creation
- Service instantiation
- Model creation

## Scalability Considerations

### Horizontal Scaling

**Current**: Single server instance
**Future**: 
- Load balancer for multiple instances
- Shared state via Redis
- Database for persistence

### Vertical Scaling

- Can handle 1000+ sensors on single server
- Memory: ~500MB for 1000 sensors
- CPU: Low usage, mostly I/O bound

### Database Scaling

**Current**: In-memory (fast but limited)
**Future**:
- PostgreSQL for structured data
- TimescaleDB for time-series data
- Redis for caching

## Security Architecture

### Current Security

- CORS configuration
- Input validation
- Error handling (no stack traces in production)
- Type safety (TypeScript)

### Future Security Enhancements

- JWT authentication
- API key management
- Rate limiting
- HTTPS/WSS enforcement
- SQL injection prevention
- XSS protection

## Performance Optimization

### Current Optimizations

- In-memory storage (fast access)
- WebSocket (low latency)
- Efficient data structures
- Minimal dependencies

### Future Optimizations

- Database indexing
- Query optimization
- Caching layer (Redis)
- CDN for frontend
- Compression (gzip)
- Connection pooling

## Monitoring & Logging

### Current Logging

- Structured logging
- Error tracking
- Request logging
- WebSocket connection tracking

### Future Monitoring

- Application Performance Monitoring (APM)
- Error tracking service (Sentry)
- Metrics collection (Prometheus)
- Health checks
- Alerting system

## Deployment Architecture

### Development
```
Local Machine
├── Backend (localhost:3001)
└── Frontend (localhost:8080)
```

### Production (Future)
```
Cloud Provider (AWS/Azure/GCP)
├── Load Balancer
├── Backend Instances (Auto-scaling)
├── Database Cluster
├── Redis Cache
├── MQTT Broker
└── CDN (Frontend)
```

## Technology Choices Rationale

### Why Express.js?
- Lightweight and fast
- Large ecosystem
- Easy to learn
- Good for REST APIs

### Why WebSocket?
- Real-time updates
- Low latency
- Efficient for frequent updates
- Better than polling

### Why React?
- Component-based
- Large ecosystem
- Good performance
- TypeScript support

### Why TypeScript?
- Type safety
- Better IDE support
- Easier refactoring
- Fewer runtime errors

## Future Architecture Enhancements

1. **Microservices**: Split into smaller services
2. **Message Queue**: RabbitMQ/Kafka for async processing
3. **API Gateway**: Kong/Apache Gateway
4. **Service Mesh**: Istio/Linkerd
5. **Event Sourcing**: For audit trail
6. **CQRS**: Separate read/write models
