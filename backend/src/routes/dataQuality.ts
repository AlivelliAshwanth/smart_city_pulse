import { Router } from 'express';
import { sensorService } from '../services/sensorService.js';
import { dataPreprocessor } from '../services/dataPreprocessor.js';
import { CustomError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/data-quality/:sensorId
 * Get data quality metrics for a specific sensor
 */
router.get('/:sensorId', (req, res) => {
  try {
    const { sensorId } = req.params;
    const sensor = sensorService.getSensorById(sensorId);

    if (!sensor) {
      throw new CustomError('Sensor not found', 404);
    }

    // Get previous reading for comparison (simplified - in production, use history)
    const metrics = dataPreprocessor.calculateQualityMetrics(sensorId, sensor);

    res.json({
      sensorId,
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Failed to get data quality metrics:', error);
    throw new CustomError('Failed to get data quality metrics', 500);
  }
});

/**
 * POST /api/data-quality/preprocess
 * Test preprocessing on sample data
 */
router.post('/preprocess', (req, res) => {
  try {
    const { sensorId, type, data } = req.body;

    if (!sensorId || !type || !data) {
      throw new CustomError('sensorId, type, and data are required', 400);
    }

    let result;
    if (type === 'water') {
      result = dataPreprocessor.preprocessWaterSensor(sensorId, data);
    } else if (type === 'air') {
      result = dataPreprocessor.preprocessAirSensor(sensorId, data);
    } else {
      throw new CustomError('Invalid type. Must be "water" or "air"', 400);
    }

    res.json({
      success: true,
      original: data,
      cleaned: result.data,
      wasCleaned: result.cleaned,
      anomalies: result.anomalies,
      warnings: result.warnings,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Failed to preprocess data:', error);
    throw new CustomError('Failed to preprocess data', 500);
  }
});

export default router;
