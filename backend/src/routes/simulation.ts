import { Router } from 'express';
import { sensorService } from '../services/sensorService.js';
import { validateSimulationRequest } from '../middleware/validator.js';
import { CustomError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const router = Router();

// WebSocket server instance will be passed via dependency injection
let wsServer: any = null;
export function setWebSocketServer(server: any) {
  wsServer = server;
}

// Get simulation status
router.get('/status', (req, res) => {
  try {
    res.json({
      active: sensorService.isSimulationActive(),
      scenario: sensorService.getActiveScenario(),
      speed: sensorService.getSimulationSpeed(),
    });
  } catch (error) {
    logger.error('Failed to get simulation status:', error);
    throw new CustomError('Failed to get simulation status', 500);
  }
});

// Start simulation
router.post('/start', validateSimulationRequest, (req, res) => {
  try {
    const { scenario, speed } = req.body;
    const speedValue = speed || 1;

    logger.info(`Starting simulation: ${scenario} at ${speedValue}x speed`);
    sensorService.startSimulation(scenario, speedValue);

    // Broadcast simulation start to WebSocket clients
    if (wsServer) {
      wsServer.broadcast({
        type: 'simulation_start',
        data: {
          id: scenario,
          label: scenario.charAt(0).toUpperCase() + scenario.slice(1),
          description: `Simulating ${scenario}`,
          active: true,
          speed: speedValue,
        },
      });
    }

    res.json({
      success: true,
      message: `Simulation ${scenario} started with speed ${speedValue}x`,
      scenario,
      speed: speedValue,
    });
  } catch (error) {
    logger.error('Failed to start simulation:', error);
    throw new CustomError('Failed to start simulation', 500);
  }
});

// Stop simulation
router.post('/stop', (req, res) => {
  try {
    logger.info('Stopping simulation');
    sensorService.stopSimulation();

    // Broadcast simulation stop to WebSocket clients
    if (wsServer) {
      wsServer.broadcast({
        type: 'simulation_stop',
      });
    }

    res.json({ success: true, message: 'Simulation stopped and sensors reset' });
  } catch (error) {
    logger.error('Failed to stop simulation:', error);
    throw new CustomError('Failed to stop simulation', 500);
  }
});

export default router;
