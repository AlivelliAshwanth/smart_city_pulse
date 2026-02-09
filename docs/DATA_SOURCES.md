# Data Sources Documentation

## Overview

City Pulse Live supports multiple data sources for sensor data, including simulated data for development/testing and real IoT sensors for production use.

## Data Source Types

### 1. Simulated Data (Default)

**Location**: `backend/src/data/initialData.ts`

**Purpose**: 
- Development and testing
- Demo purposes
- When real sensors are unavailable

**How it works**:
- Initial hardcoded sensor values
- Periodic updates with random "jitter" every 3 seconds
- Simulates realistic sensor behavior
- No external dependencies

**Initial Sensors**:
- **Water Sensors**: 5 sensors (pH, turbidity, TDS, temperature)
- **Air Sensors**: 5 sensors (PM2.5, CO₂, NO₂, humidity)
- **Initial Alerts**: 5 pre-configured alerts

**Update Mechanism**:
```typescript
// Every 3 seconds:
- Values updated with small random variations (±5-20%)
- Status recalculated based on thresholds
- New alerts generated if thresholds exceeded
```

### 2. Real IoT Sensors

**Protocols Supported**:
- **MQTT**: Message Queuing Telemetry Transport
- **HTTP REST API**: Direct HTTP POST requests

**Location**: `backend/src/services/iotConnector.ts`

**How it works**:
- Sensors connect via MQTT broker or HTTP endpoint
- Data received in real-time
- Automatic registration on first data packet
- Preprocessing and ML analysis applied

**MQTT Integration**:
- Broker URL configurable via environment variables
- Topics: `sensors/water/+` and `sensors/air/+`
- Supports authentication (username/password)
- Auto-reconnection on disconnect

**HTTP Integration**:
- Endpoint: `POST /api/iot/data`
- JSON payload format
- Optional API key authentication
- Supports both water and air sensors

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    DATA SOURCES                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐         ┌──────────────┐            │
│  │  Simulated   │         │  Real IoT    │            │
│  │    Data      │         │   Sensors    │            │
│  │              │         │              │            │
│  │ - Hardcoded  │         │ - MQTT       │            │
│  │ - Periodic   │         │ - HTTP       │            │
│  │   updates    │         │ - Real-time  │            │
│  └──────┬───────┘         └──────┬───────┘            │
│         │                        │                    │
│         └────────────┬───────────┘                    │
│                      │                                 │
│                      ▼                                 │
│         ┌──────────────────────┐                      │
│         │  Sensor Service      │                      │
│         │  (Data Management)    │                      │
│         └──────────┬───────────┘                      │
│                    │                                   │
│                    ▼                                   │
│         ┌──────────────────────┐                      │
│         │ Data Preprocessor    │                      │
│         │ - Validation         │                      │
│         │ - Cleaning           │                      │
│         │ - Outlier Detection  │                      │
│         └──────────┬───────────┘                      │
│                    │                                   │
│                    ▼                                   │
│         ┌──────────────────────┐                      │
│         │   ML Service         │                      │
│         │ - Anomaly Detection  │                      │
│         │ - Forecasting       │                      │
│         └──────────┬───────────┘                      │
│                    │                                   │
│                    ▼                                   │
│         ┌──────────────────────┐                      │
│         │   Storage &          │                      │
│         │   Broadcasting       │                      │
│         │ - In-memory storage  │                      │
│         │ - WebSocket updates  │                      │
│         └──────────────────────┘                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Sensor Data Format

### Water Sensor Data

```typescript
interface WaterSensor {
  id: string;              // Unique sensor ID
  name: string;           // Human-readable name
  lat: number;            // Latitude
  lng: number;            // Longitude
  ph: number;             // pH level (0-14)
  turbidity: number;      // Turbidity in NTU
  tds: number;            // Total Dissolved Solids in ppm
  temperature: number;    // Temperature in Celsius
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: string;    // ISO timestamp
}
```

### Air Sensor Data

```typescript
interface AirSensor {
  id: string;             // Unique sensor ID
  name: string;           // Human-readable name
  lat: number;            // Latitude
  lng: number;            // Longitude
  pm25: number;           // PM2.5 in µg/m³
  co2: number;            // CO₂ in ppm
  no2: number;            // NO₂ in ppb
  humidity: number;       // Humidity percentage (0-100)
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: string;    // ISO timestamp
}
```

## Data Update Frequency

- **Simulated Data**: Every 3 seconds
- **Real IoT Sensors**: As received (typically 1-60 seconds)
- **WebSocket Broadcast**: Every 3 seconds (all sensors)
- **ML Processing**: On each new data point
- **Alert Generation**: On threshold violations

## Data Validation Ranges

### Water Sensors

| Field | Min | Max | Critical Range | Unit |
|-------|-----|-----|----------------|------|
| pH | 0 | 14 | 6.0 - 8.5 | - |
| Turbidity | 0 | 1000 | 0 - 50 | NTU |
| TDS | 0 | 5000 | 0 - 1000 | ppm |
| Temperature | -10 | 50 | 0 - 40 | °C |

### Air Sensors

| Field | Min | Max | Critical Range | Unit |
|-------|-----|-----|----------------|------|
| PM2.5 | 0 | 1000 | 0 - 150 | µg/m³ |
| CO₂ | 0 | 5000 | 0 - 600 | ppm |
| NO₂ | 0 | 500 | 0 - 80 | ppb |
| Humidity | 0 | 100 | 0 - 100 | % |

## Data Preprocessing

All sensor data goes through preprocessing:

1. **Validation**: Range checking, type validation
2. **Cleaning**: NaN/Infinity handling, outlier removal
3. **Smoothing**: Moving average filter (window: 5)
4. **Missing Values**: Interpolation or previous value
5. **ML Analysis**: Anomaly detection, forecasting

See [DATA_PREPROCESSING.md](./DATA_PREPROCESSING.md) for details.

## Switching Between Data Sources

### Enable Simulated Data (Default)
```env
# No configuration needed - works out of the box
```

### Enable Real IoT Sensors

**MQTT**:
```env
IOT_MQTT_ENABLED=true
IOT_MQTT_BROKER_URL=mqtt://your-broker:1883
```

**HTTP**:
```env
IOT_HTTP_ENABLED=true
IOT_API_KEY=your-api-key
```

The system automatically:
- Uses real sensor data when available
- Falls back to simulated data when sensors disconnect
- Tracks which sensors are real vs simulated

## Data Storage

**Current Implementation**: In-memory storage
- Fast access
- No database required
- Data lost on server restart

**Future Enhancement**: Database persistence
- PostgreSQL/MongoDB support
- Historical data storage
- Data retention policies
- Backup and recovery

## Data Retention

- **Sensor Readings**: Last 1000 readings per sensor (in-memory)
- **Alerts**: Last 100 alerts
- **ML History**: Last 1000 readings for training
- **Time Series**: 24-hour window for analytics

## Data Export

Currently not implemented, but can be added:
- CSV export
- JSON export
- PDF reports
- Real-time data streaming

## Troubleshooting

### No Data Appearing
1. Check sensor connection (MQTT/HTTP)
2. Verify sensor registration
3. Check preprocessing logs for errors
4. Verify WebSocket connection

### Data Quality Issues
1. Check data validation ranges
2. Review preprocessing logs
3. Verify sensor calibration
4. Check ML anomaly detection results

### Performance Issues
1. Reduce update frequency
2. Limit number of sensors
3. Optimize ML processing
4. Use database for large datasets
