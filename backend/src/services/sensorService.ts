import { WaterSensor, AirSensor, Alert } from '../types.js';
import { initialWaterSensors, initialAirSensors, initialAlerts } from '../data/initialData.js';
import { v4 as uuidv4 } from 'uuid';
import { SensorDataPayload } from './iotConnector.js';
import { sensorRegistry } from './sensorRegistry.js';
import { logger } from '../utils/logger.js';
import { dataPreprocessor } from './dataPreprocessor.js';
import { mlService } from './mlService.js';

class SensorService {
  private waterSensors: WaterSensor[] = [...initialWaterSensors];
  private airSensors: AirSensor[] = [...initialAirSensors];
  private alerts: Alert[] = [...initialAlerts];
  private updateInterval: NodeJS.Timeout | null = null;
  private simulationActive: boolean = false;
  private activeScenario: string | null = null;
  private simulationSpeed: number = 1;
  private simulationInterval: NodeJS.Timeout | null = null;
  private useRealSensors: boolean = false; // Toggle between real and simulated data
  private realSensorIds: Set<string> = new Set(); // Track which sensors are real

  constructor() {
    this.startPeriodicUpdates();
  }

  /**
   * Enable/disable real sensor data
   */
  setUseRealSensors(enabled: boolean): void {
    this.useRealSensors = enabled;
    logger.info(`Real sensor data ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Process incoming real sensor data from IoT connector
   */
  processRealSensorData(payload: SensorDataPayload): void {
    const { sensorId, type, data, location } = payload;

    // Check if sensor is registered and enabled
    if (!sensorRegistry.isRegistered(sensorId)) {
      logger.warn(`Received data from unregistered sensor: ${sensorId}`);
      // Auto-register sensor if not registered
      this.autoRegisterSensor(sensorId, type, location);
    }

    if (!sensorRegistry.isEnabled(sensorId)) {
      logger.debug(`Ignoring data from disabled sensor: ${sensorId}`);
      return;
    }

    this.realSensorIds.add(sensorId);

    if (type === 'water') {
      this.updateWaterSensorFromIoT(sensorId, data, location);
    } else if (type === 'air') {
      this.updateAirSensorFromIoT(sensorId, data, location);
    }
  }

  /**
   * Auto-register sensor when first data is received
   */
  private autoRegisterSensor(sensorId: string, type: 'water' | 'air', location?: { lat: number; lng: number }): void {
    const registeredSensor = sensorRegistry.getSensor(sensorId);
    if (registeredSensor) return;

    // Try to find existing sensor with same ID or create new
    let sensor: WaterSensor | AirSensor | null = null;
    if (type === 'water') {
      sensor = this.waterSensors.find(s => s.id === sensorId) || null;
    } else {
      sensor = this.airSensors.find(s => s.id === sensorId) || null;
    }

    sensorRegistry.registerSensor({
      id: sensorId,
      name: sensor?.name || `Sensor ${sensorId}`,
      type,
      lat: location?.lat || sensor?.lat || 0,
      lng: location?.lng || sensor?.lng || 0,
      registeredAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      enabled: true,
    });
  }

  /**
   * Update water sensor with real IoT data
   */
  private updateWaterSensorFromIoT(
    sensorId: string,
    data: SensorDataPayload['data'],
    location?: { lat: number; lng: number }
  ): void {
    const existingSensor = this.waterSensors.find(s => s.id === sensorId);
    
    // Prepare raw data
    const rawData: Partial<WaterSensor> = {
      ph: data.ph,
      turbidity: data.turbidity,
      tds: data.tds,
      temperature: data.temperature,
    };

    // Preprocess and clean data
    const preprocessingResult = dataPreprocessor.preprocessWaterSensor(
      sensorId,
      rawData,
      existingSensor
    );

    // Handle missing values
    const filledData = dataPreprocessor.handleMissingValues(
      preprocessingResult.data,
      existingSensor
    );

    // Calculate quality metrics
    const qualityMetrics = dataPreprocessor.calculateQualityMetrics(
      sensorId,
      filledData,
      existingSensor
    );

    // Log preprocessing results
    if (preprocessingResult.anomalies.length > 0) {
      logger.warn(`Sensor ${sensorId} data anomalies:`, preprocessingResult.anomalies);
    }
    if (preprocessingResult.warnings.length > 0) {
      logger.debug(`Sensor ${sensorId} data warnings:`, preprocessingResult.warnings);
    }
    if (qualityMetrics.qualityScore < 80) {
      logger.warn(`Sensor ${sensorId} quality score: ${qualityMetrics.qualityScore}/100`);
    }

    // Build updated sensor with cleaned data
    const updatedSensor: WaterSensor = {
      id: sensorId,
      name: existingSensor?.name || `Water Sensor ${sensorId}`,
      lat: location?.lat ?? existingSensor?.lat ?? 0,
      lng: location?.lng ?? existingSensor?.lng ?? 0,
      ph: (filledData.ph ?? existingSensor?.ph ?? 7.0) as number,
      turbidity: (filledData.turbidity ?? existingSensor?.turbidity ?? 0) as number,
      tds: (filledData.tds ?? existingSensor?.tds ?? 0) as number,
      temperature: (filledData.temperature ?? existingSensor?.temperature ?? 20) as number,
      status: 'normal',
      lastUpdated: new Date().toISOString(),
    };

    updatedSensor.status = this.updateSensorStatus(updatedSensor);

    // Update or add sensor
    const index = this.waterSensors.findIndex(s => s.id === sensorId);
    if (index >= 0) {
      this.waterSensors[index] = updatedSensor;
    } else {
      this.waterSensors.push(updatedSensor);
    }

    // Cache in registry
    sensorRegistry.cacheSensorData(sensorId, updatedSensor);

    // Update ML service history for training
    if (filledData.ph !== undefined) {
      mlService.updateHistory(sensorId, 'ph', filledData.ph);
    }
    if (filledData.turbidity !== undefined) {
      mlService.updateHistory(sensorId, 'turbidity', filledData.turbidity);
    }
    if (filledData.tds !== undefined) {
      mlService.updateHistory(sensorId, 'tds', filledData.tds);
    }
    if (filledData.temperature !== undefined) {
      mlService.updateHistory(sensorId, 'temperature', filledData.temperature);
    }

    // ML-based anomaly detection (optional, can be enabled)
    if (filledData.ph !== undefined) {
      const mlAnomaly = mlService.detectAnomalyEnsemble(
        sensorId,
        'ph',
        filledData.ph,
        mlService.getHistory(sensorId, 'ph')
      );
      if (mlAnomaly.isAnomaly && mlAnomaly.score > 0.7) {
        logger.warn(`ML detected anomaly in ${sensorId}.ph: ${mlAnomaly.reason}`);
      }
    }

    // Check for alerts
    this.checkSensorForAlerts(updatedSensor);
  }

  /**
   * Update air sensor with real IoT data
   */
  private updateAirSensorFromIoT(
    sensorId: string,
    data: SensorDataPayload['data'],
    location?: { lat: number; lng: number }
  ): void {
    const existingSensor = this.airSensors.find(s => s.id === sensorId);
    
    // Prepare raw data
    const rawData: Partial<AirSensor> = {
      pm25: data.pm25,
      co2: data.co2,
      no2: data.no2,
      humidity: data.humidity,
    };

    // Preprocess and clean data
    const preprocessingResult = dataPreprocessor.preprocessAirSensor(
      sensorId,
      rawData,
      existingSensor
    );

    // Handle missing values
    const filledData = dataPreprocessor.handleMissingValues(
      preprocessingResult.data,
      existingSensor
    );

    // Calculate quality metrics
    const qualityMetrics = dataPreprocessor.calculateQualityMetrics(
      sensorId,
      filledData,
      existingSensor
    );

    // Log preprocessing results
    if (preprocessingResult.anomalies.length > 0) {
      logger.warn(`Sensor ${sensorId} data anomalies:`, preprocessingResult.anomalies);
    }
    if (preprocessingResult.warnings.length > 0) {
      logger.debug(`Sensor ${sensorId} data warnings:`, preprocessingResult.warnings);
    }
    if (qualityMetrics.qualityScore < 80) {
      logger.warn(`Sensor ${sensorId} quality score: ${qualityMetrics.qualityScore}/100`);
    }

    // Build updated sensor with cleaned data
    const updatedSensor: AirSensor = {
      id: sensorId,
      name: existingSensor?.name || `Air Sensor ${sensorId}`,
      lat: location?.lat ?? existingSensor?.lat ?? 0,
      lng: location?.lng ?? existingSensor?.lng ?? 0,
      pm25: (filledData.pm25 ?? existingSensor?.pm25 ?? 0) as number,
      co2: (filledData.co2 ?? existingSensor?.co2 ?? 0) as number,
      no2: (filledData.no2 ?? existingSensor?.no2 ?? 0) as number,
      humidity: (filledData.humidity ?? existingSensor?.humidity ?? 50) as number,
      status: 'normal',
      lastUpdated: new Date().toISOString(),
    };

    updatedSensor.status = this.updateSensorStatus(updatedSensor);

    // Update or add sensor
    const index = this.airSensors.findIndex(s => s.id === sensorId);
    if (index >= 0) {
      this.airSensors[index] = updatedSensor;
    } else {
      this.airSensors.push(updatedSensor);
    }

    // Cache in registry
    sensorRegistry.cacheSensorData(sensorId, updatedSensor);

    // Check for alerts
    this.checkSensorForAlerts(updatedSensor);
  }

  /**
   * Check sensor and create alerts if needed
   */
  private checkSensorForAlerts(sensor: WaterSensor | AirSensor): void {
    const status = this.updateSensorStatus(sensor);
    const existingSensor = 'ph' in sensor 
      ? this.waterSensors.find(s => s.id === sensor.id)
      : this.airSensors.find(s => s.id === sensor.id);

    if (!existingSensor) return;

    const previousStatus = existingSensor.status;

    if (status === 'critical' && previousStatus !== 'critical') {
      this.createAlert(sensor, 'critical');
    } else if (status === 'warning' && previousStatus === 'normal') {
      this.createAlert(sensor, 'warning');
    }
  }

  /**
   * Create alert for sensor
   */
  private createAlert(sensor: WaterSensor | AirSensor, severity: 'warning' | 'critical'): void {
    let message = '';
    
    if ('ph' in sensor) {
      // Water sensor
      if (sensor.ph < 6.0) {
        message = `Critical pH level critically low at ${sensor.name}`;
      } else if (sensor.ph > 8.5) {
        message = `Critical pH level critically high at ${sensor.name}`;
      } else if (sensor.turbidity > 50) {
        message = `Critical turbidity exceeds safe limit at ${sensor.name}`;
      } else if (sensor.ph < 6.5 || sensor.ph > 8.0) {
        message = `Warning pH level abnormal at ${sensor.name}`;
      } else if (sensor.turbidity > 30) {
        message = `Warning elevated turbidity at ${sensor.name}`;
      }
    } else {
      // Air sensor
      if (sensor.pm25 > 150) {
        message = `Critical PM2.5 exceeds safe limit at ${sensor.name}`;
      } else if (sensor.co2 > 600) {
        message = `Critical CO₂ exceeds safe limit at ${sensor.name}`;
      } else if (sensor.no2 > 80) {
        message = `Critical NO₂ exceeds safe limit at ${sensor.name}`;
      } else if (sensor.pm25 > 100) {
        message = `Warning PM2.5 rising at ${sensor.name}`;
      } else if (sensor.co2 > 500) {
        message = `Warning CO₂ rising at ${sensor.name}`;
      } else if (sensor.no2 > 50) {
        message = `Warning NO₂ rising at ${sensor.name}`;
      }
    }

    if (message) {
      const alert: Alert = {
        id: uuidv4(),
        type: 'ph' in sensor ? 'water' : 'air',
        severity,
        message,
        sensorId: sensor.id,
        timestamp: new Date().toISOString(),
      };
      this.alerts.unshift(alert);
      this.alerts = this.alerts.slice(0, 100);
    }
  }

  private jitter(value: number, range: number): number {
    return +(value + (Math.random() - 0.5) * range).toFixed(1);
  }

  private updateSensorStatus(sensor: WaterSensor | AirSensor): 'normal' | 'warning' | 'critical' {
    if ('ph' in sensor) {
      // Water sensor
      if (sensor.ph < 6.0 || sensor.ph > 8.5 || sensor.turbidity > 50) return 'critical';
      if (sensor.ph < 6.5 || sensor.ph > 8.0 || sensor.turbidity > 30) return 'warning';
      return 'normal';
    } else {
      // Air sensor
      if (sensor.pm25 > 150 || sensor.co2 > 600 || sensor.no2 > 80) return 'critical';
      if (sensor.pm25 > 100 || sensor.co2 > 500 || sensor.no2 > 50) return 'warning';
      return 'normal';
    }
  }

  private checkAndCreateAlerts(): Alert[] {
    const newAlerts: Alert[] = [];

    // Check water sensors
    for (const sensor of this.waterSensors) {
      const status = this.updateSensorStatus(sensor);
      if (status === 'critical' && sensor.status !== 'critical') {
        newAlerts.push({
          id: uuidv4(),
          type: 'water',
          severity: 'critical',
          message: `Critical ${sensor.ph < 6.0 ? 'pH level critically low' : sensor.turbidity > 50 ? 'turbidity exceeds safe limit' : 'TDS level high'} at ${sensor.name}`,
          sensorId: sensor.id,
          timestamp: new Date().toISOString(),
        });
      } else if (status === 'warning' && sensor.status === 'normal') {
        newAlerts.push({
          id: uuidv4(),
          type: 'water',
          severity: 'warning',
          message: `Elevated ${sensor.ph < 6.5 ? 'pH' : 'turbidity'} at ${sensor.name}`,
          sensorId: sensor.id,
          timestamp: new Date().toISOString(),
        });
      }
      sensor.status = status;
    }

    // Check air sensors
    for (const sensor of this.airSensors) {
      const status = this.updateSensorStatus(sensor);
      if (status === 'critical' && sensor.status !== 'critical') {
        newAlerts.push({
          id: uuidv4(),
          type: 'air',
          severity: 'critical',
          message: `Critical ${sensor.pm25 > 150 ? 'PM2.5' : sensor.co2 > 600 ? 'CO₂' : 'NO₂'} exceeds safe limit at ${sensor.name}`,
          sensorId: sensor.id,
          timestamp: new Date().toISOString(),
        });
      } else if (status === 'warning' && sensor.status === 'normal') {
        newAlerts.push({
          id: uuidv4(),
          type: 'air',
          severity: 'warning',
          message: `${sensor.pm25 > 100 ? 'PM2.5' : sensor.co2 > 500 ? 'CO₂' : 'NO₂'} rising at ${sensor.name}`,
          sensorId: sensor.id,
          timestamp: new Date().toISOString(),
        });
      }
      sensor.status = status;
    }

    return newAlerts;
  }

  private startPeriodicUpdates(): void {
    this.updateInterval = setInterval(() => {
      // Only update simulated sensors (not real IoT sensors)
      // Update water sensors
      this.waterSensors = this.waterSensors.map(s => {
        // Skip real sensors - they update via IoT connector
        if (this.realSensorIds.has(s.id) && this.useRealSensors) {
          return s; // Keep real sensor data as-is
        }

        // Update simulated sensors
        const updated = {
          ...s,
          ph: this.jitter(s.ph, 0.2),
          turbidity: Math.max(0, this.jitter(s.turbidity, 5)),
          tds: Math.max(0, this.jitter(s.tds, 20)),
          temperature: this.jitter(s.temperature, 0.3),
          lastUpdated: new Date().toISOString(),
        };
        updated.status = this.updateSensorStatus(updated);
        return updated;
      });

      // Update air sensors
      this.airSensors = this.airSensors.map(s => {
        // Skip real sensors - they update via IoT connector
        if (this.realSensorIds.has(s.id) && this.useRealSensors) {
          return s; // Keep real sensor data as-is
        }

        // Update simulated sensors
        const updated = {
          ...s,
          pm25: Math.max(0, this.jitter(s.pm25, 8)),
          co2: Math.max(0, this.jitter(s.co2, 15)),
          no2: Math.max(0, this.jitter(s.no2, 5)),
          humidity: Math.max(0, Math.min(100, this.jitter(s.humidity, 3))),
          lastUpdated: new Date().toISOString(),
        };
        updated.status = this.updateSensorStatus(updated);
        return updated;
      });

      // Check for new alerts (only for simulated sensors)
      if (!this.useRealSensors) {
        const newAlerts = this.checkAndCreateAlerts();
        if (newAlerts.length > 0) {
          this.alerts.unshift(...newAlerts);
          // Keep only last 100 alerts
          this.alerts = this.alerts.slice(0, 100);
        }
      }
    }, 3000);
  }

  getWaterSensors(): WaterSensor[] {
    return [...this.waterSensors];
  }

  getAirSensors(): AirSensor[] {
    return [...this.airSensors];
  }

  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  getSensorById(id: string): WaterSensor | AirSensor | null {
    const water = this.waterSensors.find(s => s.id === id);
    if (water) return water;
    const air = this.airSensors.find(s => s.id === id);
    return air || null;
  }

  startSimulation(scenario: string, speed: number): void {
    this.simulationActive = true;
    this.activeScenario = scenario;
    this.simulationSpeed = speed;

    // Clear any existing simulation interval
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }

    // Apply simulation effects periodically
    this.simulationInterval = setInterval(() => {
      this.applySimulation(scenario, speed);
    }, 1000); // Update every second

    // Apply initial simulation effect
    this.applySimulation(scenario, speed);
  }

  stopSimulation(): void {
    this.simulationActive = false;
    this.activeScenario = null;
    this.simulationSpeed = 1;

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    // Reset to initial values
    this.waterSensors = [...initialWaterSensors];
    this.airSensors = [...initialAirSensors];
    this.alerts = [...initialAlerts];
  }

  private applySimulation(scenario: string, speed: number): void {
    switch (scenario) {
      case 'pollution':
        // Increase PM2.5, CO2, NO2 in Industrial Zone A
        const industrialSensor = this.airSensors.find(s => s.id === 'a2');
        if (industrialSensor) {
          industrialSensor.pm25 = Math.min(300, industrialSensor.pm25 + (speed * 2));
          industrialSensor.co2 = Math.min(1000, industrialSensor.co2 + (speed * 5));
          industrialSensor.no2 = Math.min(150, industrialSensor.no2 + (speed * 1));
          industrialSensor.status = this.updateSensorStatus(industrialSensor);
          industrialSensor.lastUpdated = new Date().toISOString();
        }
        break;

      case 'flood':
        // Increase turbidity and TDS in water sensors
        this.waterSensors.forEach(sensor => {
          sensor.turbidity = Math.min(200, sensor.turbidity + (speed * 1.5));
          sensor.tds = Math.min(1500, sensor.tds + (speed * 5));
          sensor.status = this.updateSensorStatus(sensor);
          sensor.lastUpdated = new Date().toISOString();
        });
        break;

      case 'contamination':
        // Decrease pH and increase TDS in River Bend Station
        const riverSensor = this.waterSensors.find(s => s.id === 'w2');
        if (riverSensor) {
          riverSensor.ph = Math.max(4.0, riverSensor.ph - (speed * 0.03));
          riverSensor.tds = Math.min(2000, riverSensor.tds + (speed * 10));
          riverSensor.status = this.updateSensorStatus(riverSensor);
          riverSensor.lastUpdated = new Date().toISOString();
        }
        break;
    }
  }

  isSimulationActive(): boolean {
    return this.simulationActive;
  }

  getActiveScenario(): string | null {
    return this.activeScenario;
  }

  getSimulationSpeed(): number {
    return this.simulationSpeed;
  }

  generateTimeSeries(baseValue: number, variance: number, points: number = 24): Array<{ time: string; value: number }> {
    return Array.from({ length: points }, (_, i) => {
      const hour = String(i).padStart(2, '0');
      return {
        time: `${hour}:00`,
        value: +(baseValue + (Math.random() - 0.5) * variance * 2).toFixed(1),
      };
    });
  }

  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

export const sensorService = new SensorService();
