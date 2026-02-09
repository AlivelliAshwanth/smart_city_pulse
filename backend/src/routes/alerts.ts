import { Router } from 'express';
import { sensorService } from '../services/sensorService.js';
import { CustomError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Get all alerts with optional filtering
router.get('/', (req, res) => {
  try {
    const { severity, type, limit } = req.query;
    let alerts = sensorService.getAlerts();

    // Filter by severity
    if (severity && ['info', 'warning', 'critical'].includes(severity as string)) {
      alerts = alerts.filter(a => a.severity === severity);
    }

    // Filter by type
    if (type && ['water', 'air'].includes(type as string)) {
      alerts = alerts.filter(a => a.type === type);
    }

    // Limit results
    const limitNum = limit ? parseInt(limit as string, 10) : undefined;
    if (limitNum && limitNum > 0) {
      alerts = alerts.slice(0, limitNum);
    }

    res.json(alerts);
  } catch (error) {
    logger.error('Failed to fetch alerts:', error);
    throw new CustomError('Failed to fetch alerts', 500);
  }
});

// Get alert by ID
router.get('/:id', (req, res) => {
  try {
    const alerts = sensorService.getAlerts();
    const alert = alerts.find(a => a.id === req.params.id);
    if (!alert) {
      throw new CustomError('Alert not found', 404);
    }
    res.json(alert);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Failed to fetch alert:', error);
    throw new CustomError('Failed to fetch alert', 500);
  }
});

export default router;
