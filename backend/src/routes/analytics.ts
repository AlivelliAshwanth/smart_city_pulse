import { Router } from 'express';
import { sensorService } from '../services/sensorService.js';

const router = Router();

// Get time series data for PM2.5
router.get('/pm25', (req, res) => {
  try {
    const data = sensorService.generateTimeSeries(65, 40);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PM2.5 time series' });
  }
});

// Get time series data for pH
router.get('/ph', (req, res) => {
  try {
    const data = sensorService.generateTimeSeries(7.0, 0.8);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate pH time series' });
  }
});

// Get time series data for CO2
router.get('/co2', (req, res) => {
  try {
    const data = sensorService.generateTimeSeries(450, 100);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate CO2 time series' });
  }
});

// Get time series data for turbidity
router.get('/turbidity', (req, res) => {
  try {
    const data = sensorService.generateTimeSeries(30, 20);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate turbidity time series' });
  }
});

export default router;
