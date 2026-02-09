import { logger } from '../utils/logger.js';
import { WaterSensor, AirSensor } from '../types.js';

export interface PreprocessingResult<T> {
  data: T;
  cleaned: boolean;
  anomalies: string[];
  warnings: string[];
}

export interface DataQualityMetrics {
  isValid: boolean;
  outliers: number;
  missingFields: string[];
  anomalies: string[];
  qualityScore: number; // 0-100
}

class DataPreprocessor {
  // Valid ranges for sensor values
  private readonly WATER_RANGES = {
    ph: { min: 0, max: 14, critical: { min: 6.0, max: 8.5 } },
    turbidity: { min: 0, max: 1000, critical: { min: 0, max: 50 } },
    tds: { min: 0, max: 5000, critical: { min: 0, max: 1000 } },
    temperature: { min: -10, max: 50, critical: { min: 0, max: 40 } },
  };

  private readonly AIR_RANGES = {
    pm25: { min: 0, max: 1000, critical: { min: 0, max: 150 } },
    co2: { min: 0, max: 5000, critical: { min: 0, max: 600 } },
    no2: { min: 0, max: 500, critical: { min: 0, max: 80 } },
    humidity: { min: 0, max: 100, critical: { min: 0, max: 100 } },
  };

  // Moving average window for smoothing
  private sensorHistory: Map<string, number[]> = new Map();
  private readonly SMOOTHING_WINDOW = 5; // Number of readings to average

  /**
   * Preprocess water sensor data
   */
  preprocessWaterSensor(
    sensorId: string,
    data: Partial<WaterSensor>,
    previousData?: WaterSensor
  ): PreprocessingResult<Partial<WaterSensor>> {
    const anomalies: string[] = [];
    const warnings: string[] = [];
    const cleaned: Partial<WaterSensor> = { ...data };

    // Validate and clean each field
    if (data.ph !== undefined) {
      const result = this.validateAndClean(
        'ph',
        data.ph,
        this.WATER_RANGES.ph,
        sensorId,
        previousData?.ph
      );
      cleaned.ph = result.value;
      anomalies.push(...result.anomalies);
      warnings.push(...result.warnings);
    }

    if (data.turbidity !== undefined) {
      const result = this.validateAndClean(
        'turbidity',
        data.turbidity,
        this.WATER_RANGES.turbidity,
        sensorId,
        previousData?.turbidity
      );
      cleaned.turbidity = result.value;
      anomalies.push(...result.anomalies);
      warnings.push(...result.warnings);
    }

    if (data.tds !== undefined) {
      const result = this.validateAndClean(
        'tds',
        data.tds,
        this.WATER_RANGES.tds,
        sensorId,
        previousData?.tds
      );
      cleaned.tds = result.value;
      anomalies.push(...result.anomalies);
      warnings.push(...result.warnings);
    }

    if (data.temperature !== undefined) {
      const result = this.validateAndClean(
        'temperature',
        data.temperature,
        this.WATER_RANGES.temperature,
        sensorId,
        previousData?.temperature
      );
      cleaned.temperature = result.value;
      anomalies.push(...result.anomalies);
      warnings.push(...result.warnings);
    }

    // Apply smoothing if previous data exists
    if (previousData) {
      cleaned.ph = this.applySmoothing(sensorId, 'ph', cleaned.ph, previousData.ph);
      cleaned.turbidity = this.applySmoothing(
        sensorId,
        'turbidity',
        cleaned.turbidity,
        previousData.turbidity
      );
      cleaned.tds = this.applySmoothing(sensorId, 'tds', cleaned.tds, previousData.tds);
      cleaned.temperature = this.applySmoothing(
        sensorId,
        'temperature',
        cleaned.temperature,
        previousData.temperature
      );
    }

    return {
      data: cleaned,
      cleaned: anomalies.length > 0 || warnings.length > 0,
      anomalies,
      warnings,
    };
  }

  /**
   * Preprocess air sensor data
   */
  preprocessAirSensor(
    sensorId: string,
    data: Partial<AirSensor>,
    previousData?: AirSensor
  ): PreprocessingResult<Partial<AirSensor>> {
    const anomalies: string[] = [];
    const warnings: string[] = [];
    const cleaned: Partial<AirSensor> = { ...data };

    // Validate and clean each field
    if (data.pm25 !== undefined) {
      const result = this.validateAndClean(
        'pm25',
        data.pm25,
        this.AIR_RANGES.pm25,
        sensorId,
        previousData?.pm25
      );
      cleaned.pm25 = result.value;
      anomalies.push(...result.anomalies);
      warnings.push(...result.warnings);
    }

    if (data.co2 !== undefined) {
      const result = this.validateAndClean(
        'co2',
        data.co2,
        this.AIR_RANGES.co2,
        sensorId,
        previousData?.co2
      );
      cleaned.co2 = result.value;
      anomalies.push(...result.anomalies);
      warnings.push(...result.warnings);
    }

    if (data.no2 !== undefined) {
      const result = this.validateAndClean(
        'no2',
        data.no2,
        this.AIR_RANGES.no2,
        sensorId,
        previousData?.no2
      );
      cleaned.no2 = result.value;
      anomalies.push(...result.anomalies);
      warnings.push(...result.warnings);
    }

    if (data.humidity !== undefined) {
      const result = this.validateAndClean(
        'humidity',
        data.humidity,
        this.AIR_RANGES.humidity,
        sensorId,
        previousData?.humidity
      );
      cleaned.humidity = result.value;
      anomalies.push(...result.anomalies);
      warnings.push(...result.warnings);
    }

    // Apply smoothing if previous data exists
    if (previousData) {
      cleaned.pm25 = this.applySmoothing(sensorId, 'pm25', cleaned.pm25, previousData.pm25);
      cleaned.co2 = this.applySmoothing(sensorId, 'co2', cleaned.co2, previousData.co2);
      cleaned.no2 = this.applySmoothing(sensorId, 'no2', cleaned.no2, previousData.no2);
      cleaned.humidity = this.applySmoothing(
        sensorId,
        'humidity',
        cleaned.humidity,
        previousData.humidity
      );
    }

    return {
      data: cleaned,
      cleaned: anomalies.length > 0 || warnings.length > 0,
      anomalies,
      warnings,
    };
  }

  /**
   * Validate and clean a single value
   */
  private validateAndClean(
    fieldName: string,
    value: number,
    range: { min: number; max: number; critical: { min: number; max: number } },
    sensorId: string,
    previousValue?: number
  ): { value: number; anomalies: string[]; warnings: string[] } {
    const anomalies: string[] = [];
    const warnings: string[] = [];
    let cleanedValue = value;

    // Check for NaN or Infinity
    if (!isFinite(value)) {
      anomalies.push(`${fieldName} is not a valid number (NaN/Infinity)`);
      cleanedValue = previousValue ?? range.min;
      return { value: cleanedValue, anomalies, warnings };
    }

    // Check for out-of-range values
    if (value < range.min || value > range.max) {
      anomalies.push(
        `${fieldName} (${value}) is out of valid range [${range.min}, ${range.max}]`
      );
      // Clamp to valid range
      cleanedValue = Math.max(range.min, Math.min(range.max, value));
    }

    // Check for sudden changes (outlier detection)
    if (previousValue !== undefined) {
      const change = Math.abs(value - previousValue);
      const changePercent = (change / previousValue) * 100;

      // Flag if change is more than 50% (likely sensor error)
      if (changePercent > 50) {
        warnings.push(
          `${fieldName} changed by ${changePercent.toFixed(1)}% (${previousValue} → ${value})`
        );
        // Use weighted average if change is too large
        cleanedValue = previousValue * 0.7 + value * 0.3;
      }
    }

    // Round to reasonable precision
    cleanedValue = this.roundToPrecision(cleanedValue, fieldName);

    return { value: cleanedValue, anomalies, warnings };
  }

  /**
   * Apply moving average smoothing to reduce noise
   */
  private applySmoothing(
    sensorId: string,
    fieldName: string,
    currentValue: number | undefined,
    previousValue: number | undefined
  ): number | undefined {
    if (currentValue === undefined) return currentValue;
    if (previousValue === undefined) return currentValue;

    const key = `${sensorId}_${fieldName}`;
    const history = this.sensorHistory.get(key) || [];

    // Add current value to history
    history.push(currentValue);

    // Keep only last N values
    if (history.length > this.SMOOTHING_WINDOW) {
      history.shift();
    }

    this.sensorHistory.set(key, history);

    // Calculate moving average
    const sum = history.reduce((a, b) => a + b, 0);
    const average = sum / history.length;

    return this.roundToPrecision(average, fieldName);
  }

  /**
   * Round value to appropriate precision based on field type
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
   * Calculate data quality metrics
   */
  calculateQualityMetrics(
    sensorId: string,
    data: Partial<WaterSensor | AirSensor>,
    previousData?: WaterSensor | AirSensor
  ): DataQualityMetrics {
    const missingFields: string[] = [];
    const anomalies: string[] = [];
    let outliers = 0;

    // Check for missing required fields
    if ('ph' in data) {
      // Water sensor
      if (!data.ph && data.ph !== 0) missingFields.push('ph');
      if (!data.turbidity && data.turbidity !== 0) missingFields.push('turbidity');
    } else {
      // Air sensor
      if (!data.pm25 && data.pm25 !== 0) missingFields.push('pm25');
      if (!data.co2 && data.co2 !== 0) missingFields.push('co2');
    }

    // Check for outliers using previous data
    if (previousData) {
      if ('ph' in data && 'ph' in previousData && data.ph !== undefined) {
        const change = Math.abs(data.ph - previousData.ph);
        if (change > 2) outliers++;
      }
      if ('pm25' in data && 'pm25' in previousData && data.pm25 !== undefined) {
        const change = Math.abs(data.pm25 - previousData.pm25);
        if (change > 50) outliers++;
      }
    }

    // Calculate quality score (0-100)
    let qualityScore = 100;
    qualityScore -= missingFields.length * 10;
    qualityScore -= outliers * 5;
    qualityScore -= anomalies.length * 15;
    qualityScore = Math.max(0, Math.min(100, qualityScore));

    return {
      isValid: qualityScore >= 70 && missingFields.length === 0,
      outliers,
      missingFields,
      anomalies,
      qualityScore,
    };
  }

  /**
   * Handle missing values by interpolation or using previous value
   */
  handleMissingValues(
    data: Partial<WaterSensor | AirSensor>,
    previousData?: WaterSensor | AirSensor
  ): Partial<WaterSensor | AirSensor> {
    const filled: Partial<WaterSensor | AirSensor> = { ...data };

    if (!previousData) return filled;

    if ('ph' in data && 'ph' in previousData) {
      // Water sensor
      if (data.ph === undefined) filled.ph = previousData.ph;
      if (data.turbidity === undefined) filled.turbidity = previousData.turbidity;
      if (data.tds === undefined) filled.tds = previousData.tds;
      if (data.temperature === undefined) filled.temperature = previousData.temperature;
    } else if ('pm25' in data && 'pm25' in previousData) {
      // Air sensor
      if (data.pm25 === undefined) filled.pm25 = previousData.pm25;
      if (data.co2 === undefined) filled.co2 = previousData.co2;
      if (data.no2 === undefined) filled.no2 = previousData.no2;
      if (data.humidity === undefined) filled.humidity = previousData.humidity;
    }

    return filled;
  }

  /**
   * Detect anomalies using statistical methods
   */
  detectAnomalies(
    sensorId: string,
    fieldName: string,
    value: number,
    history: number[]
  ): { isAnomaly: boolean; reason?: string } {
    if (history.length < 3) {
      return { isAnomaly: false }; // Not enough data
    }

    // Calculate mean and standard deviation
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const variance =
      history.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / history.length;
    const stdDev = Math.sqrt(variance);

    // Z-score method: flag if value is more than 3 standard deviations from mean
    const zScore = Math.abs((value - mean) / stdDev);
    if (zScore > 3) {
      return {
        isAnomaly: true,
        reason: `Value ${value} is ${zScore.toFixed(2)} standard deviations from mean ${mean.toFixed(2)}`,
      };
    }

    // IQR method: flag if value is outside 1.5 * IQR
    const sorted = [...history].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    if (value < lowerBound || value > upperBound) {
      return {
        isAnomaly: true,
        reason: `Value ${value} is outside IQR range [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}]`,
      };
    }

    return { isAnomaly: false };
  }

  /**
   * Clear history for a sensor (useful for reset or sensor replacement)
   */
  clearHistory(sensorId: string): void {
    const keysToDelete: string[] = [];
    this.sensorHistory.forEach((_, key) => {
      if (key.startsWith(`${sensorId}_`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.sensorHistory.delete(key));
  }
}

export const dataPreprocessor = new DataPreprocessor();
