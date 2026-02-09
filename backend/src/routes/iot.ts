import { Router } from 'express';
import { sensorService } from '../services/sensorService.js';
import { sensorRegistry } from '../services/sensorRegistry.js';
import { SensorDataPayload } from '../services/iotConnector.js';
import { CustomError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * POST /api/iot/data
 * Endpoint for IoT sensors to push data via HTTP
 * Supports both water and air sensors
 */
router.post('/data', (req, res) => {
  try {
    const payload: SensorDataPayload = req.body;

    // Validate payload
    if (!payload.sensorId || !payload.type || !payload.data) {
      throw new CustomError('Invalid payload: sensorId, type, and data are required', 400);
    }

    if (!['water', 'air'].includes(payload.type)) {
      throw new CustomError('Invalid sensor type. Must be "water" or "air"', 400);
    }

    // Validate data based on type
    if (payload.type === 'water') {
      if (!payload.data.ph && !payload.data.turbidity && !payload.data.tds && !payload.data.temperature) {
        throw new CustomError('Water sensor data must include at least one of: ph, turbidity, tds, temperature', 400);
      }
    } else if (payload.type === 'air') {
      if (!payload.data.pm25 && !payload.data.co2 && !payload.data.no2 && !payload.data.humidity) {
        throw new CustomError('Air sensor data must include at least one of: pm25, co2, no2, humidity', 400);
      }
    }

    // Set timestamp if not provided
    if (!payload.timestamp) {
      payload.timestamp = new Date().toISOString();
    }

    // Process sensor data
    sensorService.processRealSensorData(payload);

    logger.debug(`Received IoT data from sensor: ${payload.sensorId}`);

    res.json({
      success: true,
      message: 'Sensor data received',
      sensorId: payload.sensorId,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Failed to process IoT sensor data:', error);
    throw new CustomError('Failed to process sensor data', 500);
  }
});

/**
 * POST /api/iot/register
 * Register a new IoT sensor
 */
router.post('/register', (req, res) => {
  try {
    const { id, name, type, lat, lng, metadata } = req.body;

    if (!id || !type || !['water', 'air'].includes(type)) {
      throw new CustomError('Invalid registration: id and type (water|air) are required', 400);
    }

    if (lat === undefined || lng === undefined) {
      throw new CustomError('Location (lat, lng) is required', 400);
    }

    sensorRegistry.registerSensor({
      id,
      name: name || `Sensor ${id}`,
      type,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      registeredAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      enabled: true,
      metadata,
    });

    logger.info(`Sensor registered: ${id} (${type})`);

    res.json({
      success: true,
      message: 'Sensor registered successfully',
      sensorId: id,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Failed to register sensor:', error);
    throw new CustomError('Failed to register sensor', 500);
  }
});

/**
 * GET /api/iot/sensors
 * Get all registered IoT sensors
 */
router.get('/sensors', (req, res) => {
  try {
    const { type } = req.query;
    
    let sensors = sensorRegistry.getAllSensors();
    
    if (type && ['water', 'air'].includes(type as string)) {
      sensors = sensorRegistry.getSensorsByType(type as 'water' | 'air');
    }

    res.json(sensors);
  } catch (error) {
    logger.error('Failed to fetch registered sensors:', error);
    throw new CustomError('Failed to fetch sensors', 500);
  }
});

/**
 * GET /api/iot/sensors/:id
 * Get specific registered sensor
 */
router.get('/sensors/:id', (req, res) => {
  try {
    const sensor = sensorRegistry.getSensor(req.params.id);
    if (!sensor) {
      throw new CustomError('Sensor not found', 404);
    }
    res.json(sensor);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to fetch sensor', 500);
  }
});

/**
 * PUT /api/iot/sensors/:id/enable
 * Enable/disable a sensor
 */
router.put('/sensors/:id/enable', (req, res) => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      throw new CustomError('enabled must be a boolean', 400);
    }

    const success = sensorRegistry.setEnabled(req.params.id, enabled);
    if (!success) {
      throw new CustomError('Sensor not found', 404);
    }

    res.json({
      success: true,
      message: `Sensor ${enabled ? 'enabled' : 'disabled'}`,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to update sensor', 500);
  }
});

/**
 * DELETE /api/iot/sensors/:id
 * Unregister a sensor
 */
router.delete('/sensors/:id', (req, res) => {
  try {
    const success = sensorRegistry.unregisterSensor(req.params.id);
    if (!success) {
      throw new CustomError('Sensor not found', 404);
    }

    res.json({
      success: true,
      message: 'Sensor unregistered',
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to unregister sensor', 500);
  }
});

export default router;
