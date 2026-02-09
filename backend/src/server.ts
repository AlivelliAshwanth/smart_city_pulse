import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer as WS } from 'ws';
import { sensorService } from './services/sensorService.js';
import sensorRoutes from './routes/sensors.js';
import alertRoutes from './routes/alerts.js';
import simulationRoutes, { setWebSocketServer } from './routes/simulation.js';
import analyticsRoutes from './routes/analytics.js';
import iotRoutes from './routes/iot.js';
import dataQualityRoutes from './routes/dataQuality.js';
import mlRoutes from './routes/ml.js';
import { WebSocketMessage } from './types.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { loadIoTConfig } from './config/iotConfig.js';
import { createIoTConnector } from './services/iotConnector.js';

const app = express();
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/sensors', sensorRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/data-quality', dataQualityRoutes);
app.use('/api/ml', mlRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    sensors: {
      water: sensorService.getWaterSensors().length,
      air: sensorService.getAirSensors().length,
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// WebSocket Server
class WebSocketServer {
  private wss: WS;
  private clients: Set<WS> = new Set();

  constructor(port: number) {
    this.wss = new WS({ port });

    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      logger.success(`WebSocket client connected. Total clients: ${this.clients.size}`);

      // Send initial data to new client
      const initialData = {
        type: 'initial_data',
        data: {
          water: sensorService.getWaterSensors(),
          air: sensorService.getAirSensors(),
          alerts: sensorService.getAlerts(),
        },
      };
      ws.send(JSON.stringify(initialData));

      ws.on('close', () => {
        this.clients.delete(ws);
        logger.info(`WebSocket client disconnected. Total clients: ${this.clients.size}`);
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
      });

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          logger.debug('WebSocket message received:', data);
          // Handle client messages if needed
        } catch (error) {
          logger.error('Failed to parse WebSocket message:', error);
        }
      });
    });

    // Broadcast sensor updates every 3 seconds
    setInterval(() => {
      this.broadcastSensorUpdates();
    }, 3000);
  }

  private broadcastSensorUpdates(): void {
    const waterSensors = sensorService.getWaterSensors();
    const airSensors = sensorService.getAirSensors();

    // Broadcast water sensor updates
    waterSensors.forEach(sensor => {
      const message: WebSocketMessage = {
        type: 'sensor_update',
        data: {
          type: 'water',
          sensor,
        },
      };
      this.broadcast(message);
    });

    // Broadcast air sensor updates
    airSensors.forEach(sensor => {
      const message: WebSocketMessage = {
        type: 'sensor_update',
        data: {
          type: 'air',
          sensor,
        },
      };
      this.broadcast(message);
    });
  }

  broadcast(message: WebSocketMessage): void {
    const data = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === WS.OPEN) {
        client.send(data);
      }
    });
  }

  getInstance(): WS {
    return this.wss;
  }
}

const wsServerInstance = new WebSocketServer(WS_PORT);
setWebSocketServer(wsServerInstance);

// Initialize IoT Connector
let iotConnector: ReturnType<typeof createIoTConnector> | null = null;

async function initializeIoT() {
  const iotConfig = loadIoTConfig();
  
  if (iotConfig.mqtt?.enabled || iotConfig.http?.enabled) {
    iotConnector = createIoTConnector(iotConfig);
    
    // Set callback to process sensor data
    iotConnector.onSensorData((payload) => {
      sensorService.processRealSensorData(payload);
    });

    // Connect to IoT services
    await iotConnector.connect();
    
    if (iotConfig.mqtt?.enabled) {
      sensorService.setUseRealSensors(true);
      logger.info('IoT MQTT connector initialized');
    }
    
    if (iotConfig.http?.enabled) {
      sensorService.setUseRealSensors(true);
      logger.info('IoT HTTP endpoint enabled');
    }
  } else {
    logger.info('IoT connectors disabled - using simulated data');
  }
}

// Start HTTP server
server.listen(PORT, async () => {
  logger.success(`🚀 Server running on http://localhost:${PORT}`);
  logger.success(`📡 WebSocket server running on ws://localhost:${WS_PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize IoT after server starts
  await initializeIoT();
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.warn(`${signal} received, shutting down gracefully...`);
  sensorService.destroy();
  
  // Disconnect IoT connector
  if (iotConnector) {
    iotConnector.disconnect();
  }
  
  // Close WebSocket server
  wsServerInstance.getInstance().close(() => {
    logger.info('WebSocket server closed');
  });

  // Close HTTP server
  server.close(() => {
    logger.success('HTTP server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
