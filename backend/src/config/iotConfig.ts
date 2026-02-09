import { IoTConfig } from '../services/iotConnector.js';

/**
 * Load IoT configuration from environment variables
 */
export function loadIoTConfig(): IoTConfig {
  const config: IoTConfig = {
    mqtt: {
      enabled: process.env.IOT_MQTT_ENABLED === 'true',
      brokerUrl: process.env.IOT_MQTT_BROKER_URL || 'mqtt://localhost:1883',
      username: process.env.IOT_MQTT_USERNAME,
      password: process.env.IOT_MQTT_PASSWORD,
      topics: {
        water: process.env.IOT_MQTT_TOPIC_WATER || 'sensors/water/+',
        air: process.env.IOT_MQTT_TOPIC_AIR || 'sensors/air/+',
      },
    },
    http: {
      enabled: process.env.IOT_HTTP_ENABLED !== 'false', // Default to true
      apiKey: process.env.IOT_API_KEY, // Optional API key for authentication
    },
  };

  return config;
}
