import { Router } from 'express';
import { mlService } from '../services/mlService.js';
import { sensorService } from '../services/sensorService.js';
import { CustomError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * POST /api/ml/anomaly-detect
 * Detect anomalies using ML algorithms
 */
router.post('/anomaly-detect', (req, res) => {
  try {
    const { sensorId, fieldName, value, method = 'ensemble' } = req.body;

    if (!sensorId || fieldName === undefined || value === undefined) {
      throw new CustomError('sensorId, fieldName, and value are required', 400);
    }

    const history = mlService.getHistory(sensorId, fieldName);

    let result;
    switch (method) {
      case 'isolation_forest':
        result = mlService.detectAnomalyIsolationForest(sensorId, fieldName, value, history);
        break;
      case 'autoencoder':
        result = mlService.detectAnomalyAutoencoder(sensorId, fieldName, value, history);
        break;
      case 'ensemble':
        result = mlService.detectAnomalyEnsemble(sensorId, fieldName, value, history);
        break;
      default:
        throw new CustomError(
          'Invalid method. Use: isolation_forest, autoencoder, or ensemble',
          400
        );
    }

    res.json({
      success: true,
      result,
      sensorId,
      fieldName,
      value,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Failed to detect anomaly:', error);
    throw new CustomError('Failed to detect anomaly', 500);
  }
});

/**
 * POST /api/ml/forecast
 * Forecast future sensor values
 */
router.post('/forecast', (req, res) => {
  try {
    const { sensorId, fieldName, method = 'lstm' } = req.body;

    if (!sensorId || !fieldName) {
      throw new CustomError('sensorId and fieldName are required', 400);
    }

    const history = mlService.getHistory(sensorId, fieldName);

    let result;
    switch (method) {
      case 'lstm':
        result = mlService.forecastLSTM(sensorId, fieldName, history);
        break;
      case 'exponential_smoothing':
        result = mlService.forecastExponentialSmoothing(sensorId, fieldName, history);
        break;
      case 'linear_regression':
        const prediction = mlService.predictLinearRegression(sensorId, fieldName, history);
        result = {
          predictions: [
            {
              time: prediction.timestamp,
              value: prediction.value,
              confidence: prediction.confidence,
            },
          ],
          method: 'linear_regression',
          horizon: 1,
        };
        break;
      default:
        throw new CustomError(
          'Invalid method. Use: lstm, exponential_smoothing, or linear_regression',
          400
        );
    }

    res.json({
      success: true,
      forecast: result,
      sensorId,
      fieldName,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Failed to generate forecast:', error);
    throw new CustomError('Failed to generate forecast', 500);
  }
});

/**
 * GET /api/ml/model-metrics/:sensorId/:fieldName
 * Get ML model performance metrics
 */
router.get('/model-metrics/:sensorId/:fieldName', (req, res) => {
  try {
    const { sensorId, fieldName } = req.params;
    const metrics = mlService.getModelMetrics(sensorId, fieldName);

    if (!metrics) {
      throw new CustomError('Model metrics not found', 404);
    }

    res.json({
      sensorId,
      fieldName,
      metrics,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to get model metrics', 500);
  }
});

/**
 * POST /api/ml/train
 * Train ML model for a sensor field
 */
router.post('/train', (req, res) => {
  try {
    const { sensorId, fieldName } = req.body;

    if (!sensorId || !fieldName) {
      throw new CustomError('sensorId and fieldName are required', 400);
    }

    mlService.trainModel(sensorId, fieldName);

    res.json({
      success: true,
      message: 'Model training initiated',
      sensorId,
      fieldName,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to train model', 500);
  }
});

export default router;
