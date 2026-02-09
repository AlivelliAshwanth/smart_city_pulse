import { Router } from 'express';
import { sensorService } from '../services/sensorService.js';
import { validateSensorId } from '../middleware/validator.js';
import { CustomError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Get all water sensors
router.get('/water', (req, res) => {
  try {
    const sensors = sensorService.getWaterSensors();
    res.json(sensors);
  } catch (error) {
    logger.error('Failed to fetch water sensors:', error);
    throw new CustomError('Failed to fetch water sensors', 500);
  }
});

// Get all air sensors
router.get('/air', (req, res) => {
  try {
    const sensors = sensorService.getAirSensors();
    res.json(sensors);
  } catch (error) {
    logger.error('Failed to fetch air sensors:', error);
    throw new CustomError('Failed to fetch air sensors', 500);
  }
});

// Get all sensors (both water and air)
router.get('/', (req, res) => {
  try {
    const water = sensorService.getWaterSensors();
    const air = sensorService.getAirSensors();
    res.json({ water, air });
  } catch (error) {
    logger.error('Failed to fetch sensors:', error);
    throw new CustomError('Failed to fetch sensors', 500);
  }
});

// Get specific sensor by ID
router.get('/:id', validateSensorId, (req, res) => {
  try {
    const sensor = sensorService.getSensorById(req.params.id);
    if (!sensor) {
      throw new CustomError('Sensor not found', 404);
    }
    res.json(sensor);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Failed to fetch sensor:', error);
    throw new CustomError('Failed to fetch sensor', 500);
  }
});

export default router;
