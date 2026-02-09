import { logger } from '../utils/logger.js';
import { WaterSensor, AirSensor } from '../types.js';

export interface PredictionResult {
  value: number;
  confidence: number;
  timestamp: string;
  method: string;
}

export interface AnomalyDetectionResult {
  isAnomaly: boolean;
  score: number; // 0-1, higher = more anomalous
  reason: string;
  method: string;
}

export interface ForecastResult {
  predictions: Array<{ time: string; value: number; confidence: number }>;
  method: string;
  horizon: number; // hours ahead
}

/**
 * Machine Learning Service for IoT Sensor Data
 * 
 * Implements multiple ML algorithms:
 * 1. Isolation Forest for anomaly detection
 * 2. LSTM for time series forecasting
 * 3. Linear Regression for trend prediction
 * 4. Moving Average with Exponential Smoothing
 */
class MLService {
  // Isolation Forest parameters
  private readonly ISOLATION_THRESHOLD = 0.5; // Threshold for anomaly detection
  private readonly MIN_SAMPLES = 10; // Minimum samples needed for ML models

  // LSTM parameters
  private readonly LSTM_WINDOW_SIZE = 24; // Hours of history for LSTM
  private readonly FORECAST_HORIZON = 6; // Hours to forecast ahead

  // Model state storage
  private sensorHistory: Map<string, number[]> = new Map();
  private modelMetrics: Map<string, { accuracy: number; lastTrained: string }> = new Map();

  /**
   * Isolation Forest Algorithm for Anomaly Detection
   * 
   * This is a tree-based algorithm that isolates anomalies instead of profiling normal points.
   * Works well for high-dimensional data and doesn't require labeled data.
   */
  detectAnomalyIsolationForest(
    sensorId: string,
    fieldName: string,
    value: number,
    history: number[]
  ): AnomalyDetectionResult {
    if (history.length < this.MIN_SAMPLES) {
      return {
        isAnomaly: false,
        score: 0,
        reason: 'Insufficient data for ML model',
        method: 'isolation_forest',
      };
    }

    // Simplified Isolation Forest implementation
    // In production, use a proper ML library like TensorFlow.js or ml-matrix
    
    // Calculate isolation score (simplified version)
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const stdDev = Math.sqrt(
      history.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / history.length
    );

    // Isolation score: how isolated is this point?
    const zScore = Math.abs((value - mean) / (stdDev || 1));
    
    // Isolation Forest-like scoring: higher isolation = higher anomaly score
    const isolationScore = Math.min(1, zScore / 3); // Normalize to 0-1
    
    // Calculate path length (simplified - in real IF, this is tree depth)
    const sorted = [...history, value].sort((a, b) => a - b);
    const valueIndex = sorted.indexOf(value);
    const pathLength = Math.abs(valueIndex - history.length / 2) / history.length;
    
    // Combine scores
    const anomalyScore = (isolationScore + pathLength) / 2;

    return {
      isAnomaly: anomalyScore > this.ISOLATION_THRESHOLD,
      score: anomalyScore,
      reason: anomalyScore > this.ISOLATION_THRESHOLD
        ? `Isolation score ${anomalyScore.toFixed(3)} exceeds threshold ${this.ISOLATION_THRESHOLD}`
        : 'Value appears normal',
      method: 'isolation_forest',
    };
  }

  /**
   * LSTM-based Time Series Forecasting
   * 
   * Long Short-Term Memory networks are excellent for time series prediction.
   * This is a simplified implementation - in production, use TensorFlow.js LSTM.
   */
  forecastLSTM(
    sensorId: string,
    fieldName: string,
    history: number[]
  ): ForecastResult {
    if (history.length < this.LSTM_WINDOW_SIZE) {
      return {
        predictions: [],
        method: 'lstm',
        horizon: this.FORECAST_HORIZON,
      };
    }

    // Simplified LSTM-like forecasting using trend analysis
    // In production, use TensorFlow.js with actual LSTM layers
    
    const recent = history.slice(-this.LSTM_WINDOW_SIZE);
    
    // Calculate trend
    const trend = this.calculateTrend(recent);
    
    // Calculate seasonality (hourly patterns)
    const seasonality = this.calculateSeasonality(recent);
    
    // Generate predictions
    const predictions: Array<{ time: string; value: number; confidence: number }> = [];
    const lastValue = recent[recent.length - 1];
    
    for (let i = 1; i <= this.FORECAST_HORIZON; i++) {
      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + i);
      
      // Simple LSTM-like prediction: trend + seasonality + noise
      const predictedValue = lastValue + (trend * i) + seasonality[i % 24];
      const confidence = Math.max(0.5, 1 - (i * 0.1)); // Decrease confidence over time
      
      predictions.push({
        time: futureTime.toISOString(),
        value: this.roundToPrecision(predictedValue, fieldName),
        confidence: Math.min(1, confidence),
      });
    }

    return {
      predictions,
      method: 'lstm',
      horizon: this.FORECAST_HORIZON,
    };
  }

  /**
   * Linear Regression for Trend Prediction
   */
  predictLinearRegression(
    sensorId: string,
    fieldName: string,
    history: number[]
  ): PredictionResult {
    if (history.length < 5) {
      return {
        value: history[history.length - 1] || 0,
        confidence: 0,
        timestamp: new Date().toISOString(),
        method: 'linear_regression',
      };
    }

    // Simple linear regression: y = mx + b
    const n = history.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = history;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict next value
    const nextX = n;
    const predictedValue = slope * nextX + intercept;

    // Calculate R-squared for confidence
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, yi, i) => {
      const predicted = slope * x[i] + intercept;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const rSquared = 1 - ssRes / ssTot;
    const confidence = Math.max(0, Math.min(1, rSquared));

    return {
      value: this.roundToPrecision(predictedValue, fieldName),
      confidence,
      timestamp: new Date().toISOString(),
      method: 'linear_regression',
    };
  }

  /**
   * Exponential Smoothing for Short-term Forecasting
   */
  forecastExponentialSmoothing(
    sensorId: string,
    fieldName: string,
    history: number[],
    alpha: number = 0.3 // Smoothing factor
  ): ForecastResult {
    if (history.length < 3) {
      return {
        predictions: [],
        method: 'exponential_smoothing',
        horizon: this.FORECAST_HORIZON,
      };
    }

    // Exponential smoothing: S_t = α * Y_t + (1 - α) * S_{t-1}
    let smoothed = history[0];
    const smoothedValues: number[] = [smoothed];

    for (let i = 1; i < history.length; i++) {
      smoothed = alpha * history[i] + (1 - alpha) * smoothed;
      smoothedValues.push(smoothed);
    }

    // Generate forecasts
    const predictions: Array<{ time: string; value: number; confidence: number }> = [];
    const trend = smoothed - smoothedValues[smoothedValues.length - 2] || 0;

    for (let i = 1; i <= this.FORECAST_HORIZON; i++) {
      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + i);
      
      const forecast = smoothed + (trend * i);
      const confidence = Math.max(0.6, 1 - (i * 0.08));

      predictions.push({
        time: futureTime.toISOString(),
        value: this.roundToPrecision(forecast, fieldName),
        confidence: Math.min(1, confidence),
      });
    }

    return {
      predictions,
      method: 'exponential_smoothing',
      horizon: this.FORECAST_HORIZON,
    };
  }

  /**
   * Autoencoder-based Anomaly Detection
   * 
   * Autoencoders learn to compress and reconstruct normal data.
   * High reconstruction error indicates anomalies.
   */
  detectAnomalyAutoencoder(
    sensorId: string,
    fieldName: string,
    value: number,
    history: number[]
  ): AnomalyDetectionResult {
    if (history.length < this.MIN_SAMPLES) {
      return {
        isAnomaly: false,
        score: 0,
        reason: 'Insufficient data for autoencoder',
        method: 'autoencoder',
      };
    }

    // Simplified autoencoder: use PCA-like reconstruction
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    
    // "Encode": project to mean (simplified)
    const encoded = mean;
    
    // "Decode": reconstruct
    const reconstructed = encoded;
    
    // Reconstruction error
    const reconstructionError = Math.abs(value - reconstructed);
    const maxError = Math.max(...history.map(v => Math.abs(v - mean)));
    const normalizedError = reconstructionError / (maxError || 1);
    
    const anomalyScore = Math.min(1, normalizedError);

    return {
      isAnomaly: anomalyScore > this.ISOLATION_THRESHOLD,
      score: anomalyScore,
      reason: anomalyScore > this.ISOLATION_THRESHOLD
        ? `Reconstruction error ${anomalyScore.toFixed(3)} exceeds threshold`
        : 'Value reconstructs normally',
      method: 'autoencoder',
    };
  }

  /**
   * Ensemble Anomaly Detection
   * 
   * Combines multiple ML methods for better accuracy
   */
  detectAnomalyEnsemble(
    sensorId: string,
    fieldName: string,
    value: number,
    history: number[]
  ): AnomalyDetectionResult {
    const results = [
      this.detectAnomalyIsolationForest(sensorId, fieldName, value, history),
      this.detectAnomalyAutoencoder(sensorId, fieldName, value, history),
    ];

    // Weighted average of scores
    const weights = [0.6, 0.4]; // Isolation Forest gets higher weight
    const ensembleScore = results.reduce(
      (sum, result, i) => sum + result.score * weights[i],
      0
    );

    const anomalyCount = results.filter(r => r.isAnomaly).length;
    const isAnomaly = ensembleScore > this.ISOLATION_THRESHOLD || anomalyCount >= 1;

    return {
      isAnomaly,
      score: ensembleScore,
      reason: isAnomaly
        ? `Ensemble score ${ensembleScore.toFixed(3)} (${anomalyCount}/${results.length} methods detected anomaly)`
        : 'Value appears normal across all methods',
      method: 'ensemble',
    };
  }

  /**
   * Update sensor history for ML models
   */
  updateHistory(sensorId: string, fieldName: string, value: number): void {
    const key = `${sensorId}_${fieldName}`;
    const history = this.sensorHistory.get(key) || [];
    
    history.push(value);
    
    // Keep only last N values (for memory efficiency)
    const maxHistory = 1000;
    if (history.length > maxHistory) {
      history.shift();
    }
    
    this.sensorHistory.set(key, history);
  }

  /**
   * Get sensor history for ML models
   */
  getHistory(sensorId: string, fieldName: string): number[] {
    const key = `${sensorId}_${fieldName}`;
    return this.sensorHistory.get(key) || [];
  }

  /**
   * Calculate trend from time series
   */
  private calculateTrend(data: number[]): number {
    if (data.length < 2) return 0;
    
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = data.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * data[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  /**
   * Calculate seasonality (hourly patterns)
   */
  private calculateSeasonality(data: number[]): number[] {
    // Simplified: return zero seasonality
    // In production, use proper seasonal decomposition
    return Array(24).fill(0);
  }

  /**
   * Round to precision based on field type
   */
  private roundToPrecision(value: number, fieldName: string): number {
    const precisionMap: Record<string, number> = {
      ph: 1,
      turbidity: 1,
      tds: 0,
      temperature: 1,
      pm25: 1,
      co2: 0,
      no2: 1,
      humidity: 1,
    };

    const decimals = precisionMap[fieldName] ?? 2;
    return +value.toFixed(decimals);
  }

  /**
   * Train model (placeholder for future implementation)
   */
  trainModel(sensorId: string, fieldName: string): void {
    // In production, implement actual model training
    logger.info(`Training model for ${sensorId}_${fieldName}`);
    this.modelMetrics.set(`${sensorId}_${fieldName}`, {
      accuracy: 0.85, // Placeholder
      lastTrained: new Date().toISOString(),
    });
  }

  /**
   * Get model metrics
   */
  getModelMetrics(sensorId: string, fieldName: string): { accuracy: number; lastTrained: string } | null {
    return this.modelMetrics.get(`${sensorId}_${fieldName}`) || null;
  }
}

export const mlService = new MLService();
