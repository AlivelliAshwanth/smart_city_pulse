import { WaterSensor, AirSensor } from '../types.js';
import { logger } from '../utils/logger.js';

export interface RegisteredSensor {
  id: string;
  name: string;
  type: 'water' | 'air';
  lat: number;
  lng: number;
  registeredAt: string;
  lastSeen: string;
  enabled: boolean;
  metadata?: {
    manufacturer?: string;
    model?: string;
    firmware?: string;
    [key: string]: any;
  };
}

class SensorRegistry {
  private registeredSensors: Map<string, RegisteredSensor> = new Map();
  private sensorDataCache: Map<string, WaterSensor | AirSensor> = new Map();

  /**
   * Register a new sensor
   */
  registerSensor(sensor: RegisteredSensor): void {
    this.registeredSensors.set(sensor.id, {
      ...sensor,
      registeredAt: sensor.registeredAt || new Date().toISOString(),
      lastSeen: new Date().toISOString(),
    });
    logger.info(`Sensor registered: ${sensor.id} (${sensor.type})`);
  }

  /**
   * Update sensor registration
   */
  updateSensor(id: string, updates: Partial<RegisteredSensor>): boolean {
    const sensor = this.registeredSensors.get(id);
    if (!sensor) {
      return false;
    }

    this.registeredSensors.set(id, {
      ...sensor,
      ...updates,
      lastSeen: new Date().toISOString(),
    });
    return true;
  }

  /**
   * Get registered sensor
   */
  getSensor(id: string): RegisteredSensor | undefined {
    return this.registeredSensors.get(id);
  }

  /**
   * Get all registered sensors
   */
  getAllSensors(): RegisteredSensor[] {
    return Array.from(this.registeredSensors.values());
  }

  /**
   * Get sensors by type
   */
  getSensorsByType(type: 'water' | 'air'): RegisteredSensor[] {
    return Array.from(this.registeredSensors.values()).filter(s => s.type === type);
  }

  /**
   * Check if sensor is registered
   */
  isRegistered(id: string): boolean {
    return this.registeredSensors.has(id);
  }

  /**
   * Check if sensor is enabled
   */
  isEnabled(id: string): boolean {
    const sensor = this.registeredSensors.get(id);
    return sensor?.enabled ?? false;
  }

  /**
   * Enable/disable sensor
   */
  setEnabled(id: string, enabled: boolean): boolean {
    return this.updateSensor(id, { enabled });
  }

  /**
   * Update sensor last seen timestamp
   */
  updateLastSeen(id: string): void {
    const sensor = this.registeredSensors.get(id);
    if (sensor) {
      sensor.lastSeen = new Date().toISOString();
      this.registeredSensors.set(id, sensor);
    }
  }

  /**
   * Cache sensor data
   */
  cacheSensorData(sensorId: string, data: WaterSensor | AirSensor): void {
    this.sensorDataCache.set(sensorId, data);
    this.updateLastSeen(sensorId);
  }

  /**
   * Get cached sensor data
   */
  getCachedSensorData(sensorId: string): WaterSensor | AirSensor | undefined {
    return this.sensorDataCache.get(sensorId);
  }

  /**
   * Remove sensor registration
   */
  unregisterSensor(id: string): boolean {
    const removed = this.registeredSensors.delete(id);
    this.sensorDataCache.delete(id);
    if (removed) {
      logger.info(`Sensor unregistered: ${id}`);
    }
    return removed;
  }

  /**
   * Get sensors that haven't been seen recently (stale sensors)
   */
  getStaleSensors(maxAgeMinutes: number = 10): RegisteredSensor[] {
    const now = Date.now();
    const maxAge = maxAgeMinutes * 60 * 1000;

    return Array.from(this.registeredSensors.values()).filter(sensor => {
      const lastSeen = new Date(sensor.lastSeen).getTime();
      return (now - lastSeen) > maxAge;
    });
  }
}

export const sensorRegistry = new SensorRegistry();
