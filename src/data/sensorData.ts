// Simulated IoT sensor data for the digital twin platform

export interface WaterSensor {
  id: string;
  name: string;
  lat: number;
  lng: number;
  ph: number;
  turbidity: number;
  tds: number;
  temperature: number;
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: string;
}

export interface AirSensor {
  id: string;
  name: string;
  lat: number;
  lng: number;
  pm25: number;
  co2: number;
  no2: number;
  humidity: number;
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: string;
}

export interface Alert {
  id: string;
  type: 'water' | 'air';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  sensorId: string;
  timestamp: string;
}

export interface TimeSeriesPoint {
  time: string;
  value: number;
}

const now = () => new Date().toISOString();

export const waterSensors: WaterSensor[] = [
  { id: 'w1', name: 'Lake Aria – North', lat: 28.6139, lng: 77.2090, ph: 7.2, turbidity: 12, tds: 320, temperature: 24.5, status: 'normal', lastUpdated: now() },
  { id: 'w2', name: 'River Bend Station', lat: 28.6280, lng: 77.2195, ph: 5.8, turbidity: 85, tds: 890, temperature: 27.1, status: 'critical', lastUpdated: now() },
  { id: 'w3', name: 'Reservoir West', lat: 28.6050, lng: 77.1950, ph: 6.9, turbidity: 28, tds: 410, temperature: 23.8, status: 'warning', lastUpdated: now() },
  { id: 'w4', name: 'Canal Sector 12', lat: 28.6350, lng: 77.2280, ph: 7.4, turbidity: 8, tds: 280, temperature: 22.3, status: 'normal', lastUpdated: now() },
  { id: 'w5', name: 'Treatment Plant Out', lat: 28.5980, lng: 77.2120, ph: 7.0, turbidity: 5, tds: 190, temperature: 25.0, status: 'normal', lastUpdated: now() },
];

export const airSensors: AirSensor[] = [
  { id: 'a1', name: 'Downtown Core', lat: 28.6200, lng: 77.2100, pm25: 45, co2: 420, no2: 28, humidity: 55, status: 'normal', lastUpdated: now() },
  { id: 'a2', name: 'Industrial Zone A', lat: 28.6320, lng: 77.2350, pm25: 180, co2: 680, no2: 95, humidity: 48, status: 'critical', lastUpdated: now() },
  { id: 'a3', name: 'Green Park Area', lat: 28.6080, lng: 77.2000, pm25: 22, co2: 390, no2: 12, humidity: 62, status: 'normal', lastUpdated: now() },
  { id: 'a4', name: 'Highway Junction', lat: 28.6180, lng: 77.2300, pm25: 95, co2: 520, no2: 55, humidity: 50, status: 'warning', lastUpdated: now() },
  { id: 'a5', name: 'Residential Block 7', lat: 28.6100, lng: 77.2180, pm25: 38, co2: 410, no2: 20, humidity: 58, status: 'normal', lastUpdated: now() },
];

export const alerts: Alert[] = [
  { id: 'al1', type: 'water', severity: 'critical', message: 'pH level critically low at River Bend Station', sensorId: 'w2', timestamp: now() },
  { id: 'al2', type: 'air', severity: 'critical', message: 'PM2.5 exceeds safe limit at Industrial Zone A', sensorId: 'a2', timestamp: now() },
  { id: 'al3', type: 'water', severity: 'warning', message: 'Elevated turbidity at Reservoir West', sensorId: 'w3', timestamp: now() },
  { id: 'al4', type: 'air', severity: 'warning', message: 'NO₂ rising at Highway Junction', sensorId: 'a4', timestamp: now() },
  { id: 'al5', type: 'air', severity: 'info', message: 'Humidity normalized at Green Park Area', sensorId: 'a3', timestamp: now() },
];

export function generateTimeSeries(baseValue: number, variance: number, points: number = 24): TimeSeriesPoint[] {
  return Array.from({ length: points }, (_, i) => {
    const hour = String(i).padStart(2, '0');
    return {
      time: `${hour}:00`,
      value: +(baseValue + (Math.random() - 0.5) * variance * 2).toFixed(1),
    };
  });
}

export const pm25History = generateTimeSeries(65, 40);
export const phHistory = generateTimeSeries(7.0, 0.8);
export const co2History = generateTimeSeries(450, 100);
export const turbidityHistory = generateTimeSeries(30, 20);
