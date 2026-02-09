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

export interface SimulationScenario {
  id: string;
  label: string;
  description: string;
  active: boolean;
  speed: number;
}

export type SensorUpdate = {
  type: 'water' | 'air';
  sensor: WaterSensor | AirSensor;
};

export type AlertUpdate = {
  alert: Alert;
};

export type WebSocketMessage = 
  | { type: 'sensor_update'; data: SensorUpdate }
  | { type: 'alert'; data: AlertUpdate }
  | { type: 'simulation_start'; data: SimulationScenario }
  | { type: 'simulation_stop' };
