# IoT Sensor Integration Guide

This guide explains how to connect real IoT sensors to the City Pulse Live platform.

## Supported Protocols

### 1. MQTT (Message Queuing Telemetry Transport)
MQTT is a lightweight messaging protocol commonly used for IoT devices.

### 2. HTTP REST API
Sensors can push data directly via HTTP POST requests.

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Enable MQTT connector
IOT_MQTT_ENABLED=true
IOT_MQTT_BROKER_URL=mqtt://your-broker-url:1883
IOT_MQTT_USERNAME=your-username
IOT_MQTT_PASSWORD=your-password
IOT_MQTT_TOPIC_WATER=sensors/water/+
IOT_MQTT_TOPIC_AIR=sensors/air/+

# Enable HTTP endpoint (default: true)
IOT_HTTP_ENABLED=true
IOT_API_KEY=your-optional-api-key
```

## MQTT Integration

### Message Format

Sensors should publish messages to the configured topics in JSON format:

**Water Sensor Topic**: `sensors/water/+` (or configured topic)
**Air Sensor Topic**: `sensors/air/+` (or configured topic)

### Water Sensor Message Example

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

### Air Sensor Message Example

```json
{
  "sensorId": "a1",
  "type": "air",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "pm25": 45,
    "co2": 420,
    "no2": 28,
    "humidity": 55
  },
  "location": {
    "lat": 28.6200,
    "lng": 77.2100
  }
}
```

## HTTP REST API Integration

### Endpoint: `POST /api/iot/data`

Sensors can push data directly via HTTP POST.

**URL**: `http://your-server:3001/api/iot/data`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY (if IOT_API_KEY is set)
```

**Request Body** (same format as MQTT):

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

**Response**:
```json
{
  "success": true,
  "message": "Sensor data received",
  "sensorId": "w1"
}
```

## Sensor Registration

### Automatic Registration
Sensors are automatically registered when they send their first data packet.

### Manual Registration: `POST /api/iot/register`

```json
{
  "id": "w1",
  "name": "Lake Aria – North",
  "type": "water",
  "lat": 28.6139,
  "lng": 77.2090,
  "metadata": {
    "manufacturer": "Acme Sensors",
    "model": "WS-2024",
    "firmware": "1.2.3"
  }
}
```

## Sensor Management

### Get All Sensors: `GET /api/iot/sensors`
### Get Sensor by ID: `GET /api/iot/sensors/:id`
### Enable/Disable Sensor: `PUT /api/iot/sensors/:id/enable`

```json
{
  "enabled": true
}
```

### Unregister Sensor: `DELETE /api/iot/sensors/:id`

## Example: Arduino/ESP32 Code

### MQTT Example (using PubSubClient library)

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "your-broker-url";
const char* mqtt_topic = "sensors/water/w1";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Read sensor values
  float ph = readPH();
  float turbidity = readTurbidity();
  float tds = readTDS();
  float temp = readTemperature();
  
  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["sensorId"] = "w1";
  doc["type"] = "water";
  doc["timestamp"] = getTimestamp();
  doc["data"]["ph"] = ph;
  doc["data"]["turbidity"] = turbidity;
  doc["data"]["tds"] = tds;
  doc["data"]["temperature"] = temp;
  doc["location"]["lat"] = 28.6139;
  doc["location"]["lng"] = 77.2090;
  
  char buffer[256];
  serializeJson(doc, buffer);
  
  client.publish(mqtt_topic, buffer);
  
  delay(3000); // Send every 3 seconds
}
```

### HTTP Example (using HTTPClient library)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://your-server:3001/api/iot/data";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON payload
    StaticJsonDocument<200> doc;
    doc["sensorId"] = "w1";
    doc["type"] = "water";
    doc["timestamp"] = getTimestamp();
    doc["data"]["ph"] = readPH();
    doc["data"]["turbidity"] = readTurbidity();
    doc["data"]["tds"] = readTDS();
    doc["data"]["temperature"] = readTemperature();
    doc["location"]["lat"] = 28.6139;
    doc["location"]["lng"] = 77.2090;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      Serial.println("Data sent successfully");
    }
    
    http.end();
  }
  
  delay(3000);
}
```

## Data Fields

### Water Sensors
- `ph` (required): pH level (0-14)
- `turbidity` (optional): Turbidity in NTU
- `tds` (optional): Total Dissolved Solids in ppm
- `temperature` (optional): Temperature in Celsius

### Air Sensors
- `pm25` (optional): PM2.5 in µg/m³
- `co2` (optional): CO₂ in ppm
- `no2` (optional): NO₂ in ppb
- `humidity` (optional): Humidity percentage (0-100)

## Status Calculation

Sensors automatically calculate status based on thresholds:

### Water Sensors
- **Critical**: pH < 6.0 or pH > 8.5 or turbidity > 50
- **Warning**: pH < 6.5 or pH > 8.0 or turbidity > 30
- **Normal**: Otherwise

### Air Sensors
- **Critical**: PM2.5 > 150 or CO₂ > 600 or NO₂ > 80
- **Warning**: PM2.5 > 100 or CO₂ > 500 or NO₂ > 50
- **Normal**: Otherwise

## Fallback Behavior

- If no real sensors are connected, the system uses simulated data
- Real sensor data takes precedence over simulated data
- If a real sensor stops sending data, it will be marked as stale after 10 minutes

## Troubleshooting

1. **MQTT Connection Failed**
   - Check broker URL and credentials
   - Verify network connectivity
   - Check firewall settings

2. **HTTP Requests Failing**
   - Verify server URL and port
   - Check API key if configured
   - Verify JSON payload format

3. **Sensors Not Appearing**
   - Check sensor registration
   - Verify sensor ID format
   - Check logs for errors

## Security Considerations

1. Use TLS/SSL for MQTT (mqtts://)
2. Set strong API keys for HTTP endpoints
3. Implement authentication for production
4. Use VPN or private networks for sensor communication
5. Regularly update sensor firmware
