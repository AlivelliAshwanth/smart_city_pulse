import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { airSensors, waterSensors } from '@/data/sensorData';
import { DemoEngine, airStatus, waterStatus } from './demoEngine';

const air = (engine: DemoEngine, id: string) => engine.getSnapshot().air.find((s) => s.id === id)!;
const water = (engine: DemoEngine, id: string) =>
  engine.getSnapshot().water.find((s) => s.id === id)!;

describe('DemoEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('applies the backend thresholds', () => {
    expect(waterStatus({ ph: 7, turbidity: 10 })).toBe('normal');
    expect(waterStatus({ ph: 6.4, turbidity: 10 })).toBe('warning');
    expect(waterStatus({ ph: 7, turbidity: 51 })).toBe('critical');
    expect(airStatus({ pm25: 20, co2: 400, no2: 10 })).toBe('normal');
    expect(airStatus({ pm25: 101, co2: 400, no2: 10 })).toBe('warning');
    expect(airStatus({ pm25: 20, co2: 400, no2: 81 })).toBe('critical');
  });

  it('publishes reading updates on a timer while subscribed', () => {
    const engine = new DemoEngine();
    const listener = vi.fn();
    const unsubscribe = engine.subscribe(listener);
    expect(listener).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(9000);
    expect(listener).toHaveBeenCalledTimes(4);

    unsubscribe();
    vi.advanceTimersByTime(9000);
    expect(listener).toHaveBeenCalledTimes(4);
  });

  it('spreads pollution from the source and weakens it with distance', () => {
    const engine = new DemoEngine();
    const zone = air(engine, 'a2').pm25;
    const park = air(engine, 'a3').pm25;

    engine.startSimulation('pollution', 10);
    engine.applyScenario();

    expect(air(engine, 'a2').pm25 - zone).toBeCloseTo(40);
    expect(air(engine, 'a3').pm25 - park).toBeCloseTo(6);
  });

  it('raises an alert when a scenario makes a sensor worse', () => {
    const engine = new DemoEngine();
    const before = engine.getSnapshot().alerts.length;

    engine.startSimulation('flood', 10);
    for (let i = 0; i < 5; i++) engine.applyScenario();

    const { alerts } = engine.getSnapshot();
    expect(alerts.length).toBeGreaterThan(before);
    expect(alerts.some((a) => a.sensorId === 'w1' && a.severity === 'critical')).toBe(true);
    expect(water(engine, 'w1').status).toBe('critical');
  });

  it('does not repeat an alert during the cooldown', () => {
    const engine = new DemoEngine();
    const count = () =>
      engine.getSnapshot().alerts.filter((a) => a.sensorId === 'a5' && a.severity === 'warning')
        .length;
    const raise = (engine as unknown as { raiseAlertIfWorse: (s: unknown, st: string) => void })
      .raiseAlertIfWorse.bind(engine);
    const sensor = { ...air(engine, 'a5'), status: 'normal', pm25: 120 };

    raise(sensor, 'warning');
    raise(sensor, 'warning');
    expect(count()).toBe(1);

    vi.advanceTimersByTime(60_000);
    raise(sensor, 'warning');
    expect(count()).toBe(2);
  });

  it('resets to the starting data when stopped, without changing the source data', () => {
    const originalPm25 = airSensors[1].pm25;
    const originalTurbidity = waterSensors[0].turbidity;
    const engine = new DemoEngine();

    engine.startSimulation('pollution', 10);
    engine.applyScenario();
    expect(engine.isRunning()).toBe(true);

    engine.stopSimulation();
    expect(engine.isRunning()).toBe(false);
    expect(air(engine, 'a2').pm25).toBe(originalPm25);
    expect(airSensors[1].pm25).toBe(originalPm25);
    expect(waterSensors[0].turbidity).toBe(originalTurbidity);
  });

  it('keeps long-running readings near their baseline', () => {
    const engine = new DemoEngine();
    for (let i = 0; i < 2000; i++) engine.updateReadings();

    expect(Math.abs(air(engine, 'a3').pm25 - 22)).toBeLessThan(40);
    expect(Math.abs(water(engine, 'w4').ph - 7.4)).toBeLessThan(1);
  });
});
