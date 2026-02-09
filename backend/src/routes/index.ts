import { Router } from 'express';
import sensorRoutes from './sensors.js';
import alertRoutes from './alerts.js';
import simulationRoutes from './simulation.js';
import analyticsRoutes from './analytics.js';

const router = Router();

router.use('/sensors', sensorRoutes);
router.use('/alerts', alertRoutes);
router.use('/simulation', simulationRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
