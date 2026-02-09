# Data Preprocessing & Cleaning Documentation

## Overview

The City Pulse Live platform includes comprehensive data preprocessing and cleaning steps to ensure data quality and reliability from IoT sensors.

## Features

### 1. **Data Validation**
- Range checking for all sensor values
- NaN and Infinity detection
- Type validation
- Critical threshold validation

### 2. **Outlier Detection**
- Statistical outlier detection using Z-score method
- Interquartile Range (IQR) method
- Sudden change detection (>50% change flagged)
- Automatic smoothing for outliers

### 3. **Data Cleaning**
- Clamping values to valid ranges
- Handling NaN/Infinity values
- Missing value interpolation
- Data smoothing using moving averages

### 4. **Data Quality Metrics**
- Quality score calculation (0-100)
- Missing field detection
- Anomaly counting
- Outlier identification

## Preprocessing Steps

### Step 1: Validation
```typescript
// Checks:
- Value is finite (not NaN/Infinity)
- Value is within valid range
- Value type is correct
```

### Step 2: Outlier Detection
```typescript
// Methods:
- Z-score: Flags values >3 standard deviations
- IQR: Flags values outside 1.5 * IQR
- Change detection: Flags >50% change from previous
```

### Step 3: Cleaning
```typescript
// Actions:
- Clamp out-of-range values
- Replace NaN/Infinity with previous value or default
- Apply weighted average for sudden changes
- Round to appropriate precision
```

### Step 4: Smoothing
```typescript
// Moving Average Filter:
- Window size: 5 readings
- Reduces noise in sensor readings
- Maintains trend while smoothing spikes
```

### Step 5: Missing Value Handling
```typescript
// Strategies:
- Use previous value if available
- Use default value if no history
- Interpolation for time series
```

## Valid Ranges

### Water Sensors
| Field | Min | Max | Critical Range |
|-------|-----|-----|----------------|
| pH | 0 | 14 | 6.0 - 8.5 |
| Turbidity | 0 | 1000 | 0 - 50 NTU |
| TDS | 0 | 5000 | 0 - 1000 ppm |
| Temperature | -10 | 50 | 0 - 40 °C |

### Air Sensors
| Field | Min | Max | Critical Range |
|-------|-----|-----|----------------|
| PM2.5 | 0 | 1000 | 0 - 150 µg/m³ |
| CO₂ | 0 | 5000 | 0 - 600 ppm |
| NO₂ | 0 | 500 | 0 - 80 ppb |
| Humidity | 0 | 100 | 0 - 100% |

## Data Quality Scoring

Quality score is calculated as:
```
Base Score: 100
- Missing fields: -10 per field
- Outliers: -5 per outlier
- Anomalies: -15 per anomaly
Final Score: max(0, min(100, calculated))
```

**Score Interpretation:**
- 90-100: Excellent quality
- 80-89: Good quality
- 70-79: Acceptable quality
- <70: Poor quality (data may be unreliable)

## API Endpoints

### Get Data Quality Metrics
```
GET /api/data-quality/:sensorId
```

Response:
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

### Test Preprocessing
```
POST /api/data-quality/preprocess
```

Request:
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

Response:
```json
{
  "success": true,
  "original": {
    "ph": 7.2,
    "turbidity": 12
  },
  "cleaned": {
    "ph": 7.2,
    "turbidity": 12.0
  },
  "wasCleaned": false,
  "anomalies": [],
  "warnings": []
}
```

## Example: Handling Bad Data

### Input (Bad Data):
```json
{
  "sensorId": "w1",
  "type": "water",
  "data": {
    "ph": NaN,
    "turbidity": 1500,  // Out of range
    "tds": 320
  }
}
```

### Preprocessing Steps:
1. **ph = NaN** → Detected as invalid → Replaced with previous value (7.0)
2. **turbidity = 1500** → Out of range (max: 1000) → Clamped to 1000
3. **tds = 320** → Valid → Kept as-is

### Output (Cleaned Data):
```json
{
  "ph": 7.0,
  "turbidity": 1000.0,
  "tds": 320
}
```

### Anomalies Detected:
```json
{
  "anomalies": [
    "ph is not a valid number (NaN/Infinity)",
    "turbidity (1500) is out of valid range [0, 1000]"
  ],
  "warnings": []
}
```

## Smoothing Example

### Raw Sensor Readings:
```
Reading 1: 7.2
Reading 2: 7.5
Reading 3: 7.1
Reading 4: 7.8  (spike)
Reading 5: 7.3
```

### After Smoothing (Moving Average):
```
Reading 1: 7.2
Reading 2: 7.35
Reading 3: 7.27
Reading 4: 7.40  (smoothed spike)
Reading 5: 7.38
```

## Logging

Preprocessing results are logged:
- **Warnings**: Data quality issues (logged at debug level)
- **Anomalies**: Serious data problems (logged at warn level)
- **Quality Scores**: Low scores (<80) logged at warn level

## Configuration

Preprocessing behavior can be adjusted in `dataPreprocessor.ts`:
- `SMOOTHING_WINDOW`: Number of readings for moving average (default: 5)
- Range values: Adjust valid ranges per sensor type
- Change threshold: Percentage change that triggers warning (default: 50%)

## Best Practices

1. **Always validate** incoming sensor data before processing
2. **Log anomalies** for monitoring and debugging
3. **Use quality scores** to determine data reliability
4. **Handle missing values** gracefully with fallbacks
5. **Monitor preprocessing** logs for sensor health

## Integration

Preprocessing is automatically applied to all IoT sensor data:
- MQTT messages are preprocessed before storage
- HTTP POST data is preprocessed before processing
- Simulated data uses same validation rules

No additional configuration needed - preprocessing runs automatically!
