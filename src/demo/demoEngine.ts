// Runs the sensor simulation in the browser, so the dashboard can be hosted
// as a static site with no backend. Enable it with `npm run dev:demo` or
// `npm run build:demo`.
import {
  alerts as initialAlerts,
  airSensors as initialAirSensors,
  waterSensors as initialWaterSensors,
} from '@/data/sensorData';
import type { Alert, AirSensor, WaterSensor } from '@/data/sensorData';

export const isDemoMode = import.meta.env.MODE === 'demo';

export type Scenario = 'pollution' | 'flood' | 'contamination';
type Status = WaterSensor['status'];

export interface DemoSnapshot {
  water: WaterSensor[];
  air: AirSensor[];
  alerts: Alert[];
}

const READING_INTERVAL_MS = 3000;
const SIMULATION_INTERVAL_MS = 1000;
const ALERT_COOLDOWN_MS = 60_000;
const MAX_ALERTS = 100;
// How strongly readings drift back to their baseline when no scenario is running.
const BASELINE_PULL = 0.05;

// Share of a scenario's effect that reaches each sensor, by distance from the source.
const POLLUTION_SPREAD: Record<string, number> = { a2: 1, a4: 0.7, a1: 0.45, a5: 0.3, a3: 0.15 };
const CONTAMINATION_SPREAD: Record<string, number> = { w2: 1, w4: 0.6, w1: 0.35 };

const round = (value: number) => +value.toFixed(1);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// These match the backend's thresholds in backend/src/services/sensorService.ts.
export function waterStatus(s: Pick<WaterSensor, 'ph' | 'turbidity'>): Status {
  if (s.ph < 6.0 || s.ph > 8.5 || s.turbidity > 50) return 'critical';
  if (s.ph < 6.5 || s.ph > 8.0 || s.turbidity > 30) return 'warning';
  return 'normal';
}

export function airStatus(s: Pick<AirSensor, 'pm25' | 'co2' | 'no2'>): Status {
  if (s.pm25 > 150 || s.co2 > 600 || s.no2 > 80) return 'critical';
  if (s.pm25 > 100 || s.co2 > 500 || s.no2 > 50) return 'warning';
  return 'normal';
}

function waterAlertMessage(s: WaterSensor, status: Status): string {
  if (status === 'critical') {
    return s.ph < 6.0 || s.ph > 8.5
      ? `pH level critical at ${s.name}`
      : `Turbidity exceeds safe limit at ${s.name}`;
  }
  return s.ph < 6.5 || s.ph > 8.0 ? `Elevated pH at ${s.name}` : `Elevated turbidity at ${s.name}`;
}

function airAlertMessage(s: AirSensor, status: Status): string {
  const limits = status === 'critical' ? { pm25: 150, co2: 600 } : { pm25: 100, co2: 500 };
  const metric = s.pm25 > limits.pm25 ? 'PM2.5' : s.co2 > limits.co2 ? 'CO₂' : 'NO₂';
  return status === 'critical'
    ? `${metric} exceeds safe limit at ${s.name}`
    : `${metric} rising at ${s.name}`;
}

export class DemoEngine {
  private water: WaterSensor[] = [];
  private air: AirSensor[] = [];
  private alerts: Alert[] = [];
  private scenario: Scenario | null = null;
  private speed = 1;
  private listeners = new Set<(snapshot: DemoSnapshot) => void>();
  private readingTimer: ReturnType<typeof setInterval> | null = null;
  private simulationTimer: ReturnType<typeof setInterval> | null = null;
  private lastAlertAt = new Map<string, number>();
  private alertCount = 0;

  constructor() {
    this.loadInitialState();
  }

  getSnapshot(): DemoSnapshot {
    return { water: this.water, air: this.air, alerts: this.alerts };
  }

  isRunning(): boolean {
    return this.scenario !== null;
  }

  // The engine only runs timers while the dashboard is listening.
  subscribe(listener: (snapshot: DemoSnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    if (!this.readingTimer) {
      this.readingTimer = setInterval(() => this.updateReadings(), READING_INTERVAL_MS);
    }
    if (this.scenario && !this.simulationTimer) this.startSimulationTimer();

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.clearTimers();
    };
  }

  startSimulation(scenario: Scenario, speed: number): void {
    this.scenario = scenario;
    this.speed = speed;
    if (this.simulationTimer) clearInterval(this.simulationTimer);
    this.simulationTimer = null;
    if (this.listeners.size > 0) this.startSimulationTimer();
    this.applyScenario();
  }

  // Like the backend, stopping a simulation also resets the sensors.
  stopSimulation(): void {
    this.scenario = null;
    this.speed = 1;
    if (this.simulationTimer) clearInterval(this.simulationTimer);
    this.simulationTimer = null;
    this.loadInitialState();
    this.notify();
  }

  // Normal sensor noise, published every few seconds.
  updateReadings(): void {
    this.water = this.water.map((s) => {
      const base = initialWaterSensors.find((i) => i.id === s.id)!;
      return this.withStatus({
        ...s,
        ph: clamp(this.drift(s.ph, base.ph, 0.2), 0, 14),
        turbidity: Math.max(0, this.drift(s.turbidity, base.turbidity, 5)),
        tds: Math.max(0, this.drift(s.tds, base.tds, 20)),
        temperature: this.drift(s.temperature, base.temperature, 0.3),
      });
    });
    this.air = this.air.map((s) => {
      const base = initialAirSensors.find((i) => i.id === s.id)!;
      return this.withStatus({
        ...s,
        pm25: Math.max(0, this.drift(s.pm25, base.pm25, 8)),
        co2: Math.max(0, this.drift(s.co2, base.co2, 15)),
        no2: Math.max(0, this.drift(s.no2, base.no2, 5)),
        humidity: clamp(this.drift(s.humidity, base.humidity, 3), 0, 100),
      });
    });
    this.notify();
  }

  // One step of the active scenario. Rates match the backend at the source sensor.
  applyScenario(): void {
    const speed = this.speed;
    if (this.scenario === 'pollution') {
      this.air = this.air.map((s) => {
        const share = POLLUTION_SPREAD[s.id] ?? 0;
        return this.withStatus({
          ...s,
          pm25: round(Math.min(300, s.pm25 + speed * 2 * share)),
          co2: round(Math.min(1000, s.co2 + speed * 5 * share)),
          no2: round(Math.min(150, s.no2 + speed * share)),
        });
      });
    } else if (this.scenario === 'flood') {
      this.water = this.water.map((s) =>
        this.withStatus({
          ...s,
          turbidity: round(Math.min(200, s.turbidity + speed * 1.5)),
          tds: round(Math.min(1500, s.tds + speed * 5)),
        }),
      );
    } else if (this.scenario === 'contamination') {
      this.water = this.water.map((s) => {
        const share = CONTAMINATION_SPREAD[s.id] ?? 0;
        return this.withStatus({
          ...s,
          ph: +Math.max(4, s.ph - speed * 0.03 * share).toFixed(2),
          tds: round(Math.min(2000, s.tds + speed * 10 * share)),
        });
      });
    }
    this.notify();
  }

  private loadInitialState(): void {
    const timestamp = new Date().toISOString();
    this.water = initialWaterSensors.map((s) => ({ ...s, lastUpdated: timestamp }));
    this.air = initialAirSensors.map((s) => ({ ...s, lastUpdated: timestamp }));
    this.alerts = initialAlerts.map((a) => ({ ...a, timestamp }));
    this.lastAlertAt.clear();
  }

  // Random noise, plus a gentle pull to baseline so idle tabs don't wander off.
  private drift(value: number, baseline: number, range: number): number {
    const pull = this.scenario ? 0 : (baseline - value) * BASELINE_PULL;
    return round(value + (Math.random() - 0.5) * range + pull);
  }

  private withStatus<T extends WaterSensor | AirSensor>(sensor: T): T {
    const status = 'ph' in sensor ? waterStatus(sensor) : airStatus(sensor);
    this.raiseAlertIfWorse(sensor, status);
    return { ...sensor, status, lastUpdated: new Date().toISOString() };
  }

  private raiseAlertIfWorse(sensor: WaterSensor | AirSensor, status: Status): void {
    const worsened =
      (status === 'critical' && sensor.status !== 'critical') ||
      (status === 'warning' && sensor.status === 'normal');
    if (!worsened) return;

    // Noise near a threshold can flip a status repeatedly, so limit repeat alerts.
    const key = `${sensor.id}:${status}`;
    const now = Date.now();
    if (now - (this.lastAlertAt.get(key) ?? -Infinity) < ALERT_COOLDOWN_MS) return;
    this.lastAlertAt.set(key, now);

    const isWater = 'ph' in sensor;
    const alert: Alert = {
      id: `demo-${++this.alertCount}`,
      type: isWater ? 'water' : 'air',
      severity: status === 'critical' ? 'critical' : 'warning',
      message: isWater ? waterAlertMessage(sensor, status) : airAlertMessage(sensor, status),
      sensorId: sensor.id,
      timestamp: new Date(now).toISOString(),
    };
    this.alerts = [alert, ...this.alerts].slice(0, MAX_ALERTS);
  }

  private startSimulationTimer(): void {
    this.simulationTimer = setInterval(() => this.applyScenario(), SIMULATION_INTERVAL_MS);
  }

  private clearTimers(): void {
    if (this.readingTimer) clearInterval(this.readingTimer);
    if (this.simulationTimer) clearInterval(this.simulationTimer);
    this.readingTimer = null;
    this.simulationTimer = null;
  }

  private notify(): void {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}

export const demoEngine = new DemoEngine();
