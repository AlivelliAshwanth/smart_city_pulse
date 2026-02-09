import mqtt, { MqttClient } from 'mqtt';
import { WaterSensor, AirSensor } from '../types.js';
import { logger } from '../utils/logger.js';

export interface SensorDataPayload {
  sensorId: string;
  type: 'water' | 'air';
  timestamp: string;
  data: {
    // Water sensor data
    ph?: number;
    turbidity?: number;
    tds?: number;
    temperature?: number;
    // Air sensor data
    pm25?: number;
    co2?: number;
    no2?: number;
    humidity?: number;
  };
  location?: {
    lat: number;
    lng: number;
  };
}

export interface IoTConfig {
  mqtt?: {
    enabled: boolean;
    brokerUrl: string;
    username?: string;
    password?: string;
    topics: {
      water: string;
      air: string;
    };
  };
  http?: {
    enabled: boolean;
    apiKey?: string;
  };
}

class IoTConnector {
  private mqttClient: MqttClient | null = null;
  private config: IoTConfig;
  private onSensorDataCallback: ((payload: SensorDataPayload) => void) | null = null;
  private connected: boolean = false;

  constructor(config: IoTConfig) {
    this.config = config;
  }

  /**
   * Initialize MQTT connection if enabled
   */
  async connect(): Promise<void> {
    if (this.config.mqtt?.enabled) {
      await this.connectMQTT();
    }
  }

  /**
   * Connect to MQTT broker
   */
  private async connectMQTT(): Promise<void> {
    if (!this.config.mqtt) return;

    try {
      const options: mqtt.IClientOptions = {
        reconnectPeriod: 5000,
        connectTimeout: 30000,
      };

      if (this.config.mqtt.username && this.config.mqtt.password) {
        options.username = this.config.mqtt.username;
        options.password = this.config.mqtt.password;
      }

      this.mqttClient = mqtt.connect(this.config.mqtt.brokerUrl, options);

      this.mqttClient.on('connect', () => {
        logger.success('MQTT client connected');
        this.connected = true;

        // Subscribe to sensor topics
        if (this.mqttClient) {
          this.mqttClient.subscribe(this.config.mqtt!.topics.water, (err) => {
            if (err) {
              logger.error('Failed to subscribe to water sensor topic:', err);
            } else {
              logger.info(`Subscribed to water sensor topic: ${this.config.mqtt!.topics.water}`);
            }
          });

          this.mqttClient.subscribe(this.config.mqtt!.topics.air, (err) => {
            if (err) {
              logger.error('Failed to subscribe to air sensor topic:', err);
            } else {
              logger.info(`Subscribed to air sensor topic: ${this.config.mqtt!.topics.air}`);
            }
          });
        }
      });

      this.mqttClient.on('message', (topic, message) => {
        try {
          const payload: SensorDataPayload = JSON.parse(message.toString());
          this.handleSensorData(payload);
        } catch (error) {
          logger.error('Failed to parse MQTT message:', error);
        }
      });

      this.mqttClient.on('error', (error) => {
        logger.error('MQTT error:', error);
        this.connected = false;
      });

      this.mqttClient.on('close', () => {
        logger.warn('MQTT connection closed');
        this.connected = false;
      });

      this.mqttClient.on('reconnect', () => {
        logger.info('MQTT reconnecting...');
      });
    } catch (error) {
      logger.error('Failed to connect to MQTT broker:', error);
      this.connected = false;
    }
  }

  /**
   * Handle incoming sensor data from MQTT or HTTP
   */
  handleSensorData(payload: SensorDataPayload): void {
    if (this.onSensorDataCallback) {
      this.onSensorDataCallback(payload);
    }
  }

  /**
   * Set callback for when sensor data is received
   */
  onSensorData(callback: (payload: SensorDataPayload) => void): void {
    this.onSensorDataCallback = callback;
  }

  /**
   * Publish command to sensor (e.g., calibration request)
   */
  publishCommand(sensorId: string, command: string, data?: any): void {
    if (!this.mqttClient || !this.connected) {
      logger.warn('MQTT client not connected, cannot publish command');
      return;
    }

    const topic = `sensors/${sensorId}/commands`;
    const message = JSON.stringify({ command, data, timestamp: new Date().toISOString() });

    this.mqttClient.publish(topic, message, (error) => {
      if (error) {
        logger.error(`Failed to publish command to ${sensorId}:`, error);
      } else {
        logger.debug(`Published command to ${sensorId}: ${command}`);
      }
    });
  }

  /**
   * Check if IoT connector is connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Disconnect from IoT services
   */
  disconnect(): void {
    if (this.mqttClient) {
      this.mqttClient.end();
      this.mqttClient = null;
      this.connected = false;
      logger.info('MQTT client disconnected');
    }
  }
}

export const createIoTConnector = (config: IoTConfig): IoTConnector => {
  return new IoTConnector(config);
};
