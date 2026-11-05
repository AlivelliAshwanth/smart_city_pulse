import { useState, useEffect, useCallback } from 'react';
import type { WaterSensor, AirSensor, Alert, TimeSeriesPoint } from '@/data/sensorData';
import { pm25History as demoPm25History, phHistory as demoPhHistory } from '@/data/sensorData';
import { demoEngine, isDemoMode } from '@/demo/demoEngine';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3002';

export function useSensorData() {
  const [water, setWater] = useState<WaterSensor[]>([]);
  const [air, setAir] = useState<AirSensor[]>([]);
  const [currentAlerts, setAlerts] = useState<Alert[]>([]);
  const [pm25History, setPm25History] = useState<TimeSeriesPoint[]>([]);
  const [phHistory, setPhHistory] = useState<TimeSeriesPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    if (isDemoMode) {
      setPm25History(demoPm25History);
      setPhHistory(demoPhHistory);
      setLoading(false);
      return demoEngine.subscribe((snapshot) => {
        setWater(snapshot.water);
        setAir(snapshot.air);
        setAlerts(snapshot.alerts);
      });
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [waterRes, airRes, alertsRes, pm25Res, phRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/sensors/water`),
          fetch(`${API_BASE_URL}/api/sensors/air`),
          fetch(`${API_BASE_URL}/api/alerts`),
          fetch(`${API_BASE_URL}/api/analytics/pm25`),
          fetch(`${API_BASE_URL}/api/analytics/ph`),
        ]);

        if (!waterRes.ok || !airRes.ok || !alertsRes.ok) {
          throw new Error('Failed to fetch sensor data');
        }

        const waterData = await waterRes.json();
        const airData = await airRes.json();
        const alertsData = await alertsRes.json();
        const pm25Data = await pm25Res.json();
        const phData = await phRes.json();

        setWater(waterData);
        setAir(airData);
        setAlerts(alertsData);
        setPm25History(pm25Data);
        setPhHistory(phData);
        setError(null);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load sensor data');
        // Fallback to empty arrays on error
        setWater([]);
        setAir([]);
        setAlerts([]);
        setPm25History([]);
        setPhHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (isDemoMode) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;
    const reconnectDelay = 3000;

    const connectWebSocket = () => {
      try {
        if (reconnectAttempts >= maxReconnectAttempts) {
          setError('Failed to connect to WebSocket server after multiple attempts');
          return;
        }

        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          console.log('WebSocket connected');
          setError(null);
          reconnectAttempts = 0; // Reset on successful connection
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            switch (message.type) {
              case 'initial_data':
                // Handle initial data sent on connection
                if (message.data.water) setWater(message.data.water);
                if (message.data.air) setAir(message.data.air);
                if (message.data.alerts) setAlerts(message.data.alerts);
                break;

              case 'sensor_update':
                if (message.data.type === 'water') {
                  setWater((prev) =>
                    prev.map((s) =>
                      s.id === message.data.sensor.id ? message.data.sensor : s
                    )
                  );
                } else if (message.data.type === 'air') {
                  setAir((prev) =>
                    prev.map((s) =>
                      s.id === message.data.sensor.id ? message.data.sensor : s
                    )
                  );
                }
                break;

              case 'alert':
                setAlerts((prev) => [message.data.alert, ...prev].slice(0, 100));
                break;

              case 'simulation_start':
              case 'simulation_stop':
                // Refresh data when simulation changes
                Promise.all([
                  fetch(`${API_BASE_URL}/api/sensors/water`).then((res) => res.json()),
                  fetch(`${API_BASE_URL}/api/sensors/air`).then((res) => res.json()),
                ])
                  .then(([waterData, airData]) => {
                    setWater(waterData);
                    setAir(airData);
                  })
                  .catch((err) => console.error('Error refreshing sensor data:', err));
                break;
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reconnectAttempts++;
        };

        ws.onclose = (event) => {
          console.log('WebSocket disconnected', event.code, event.reason);
          if (event.code !== 1000) {
            // Not a normal closure
            reconnectAttempts++;
            reconnectTimeout = setTimeout(connectWebSocket, reconnectDelay);
          }
        };
      } catch (err) {
        console.error('Error connecting WebSocket:', err);
        reconnectAttempts++;
        reconnectTimeout = setTimeout(connectWebSocket, reconnectDelay);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close(1000, 'Component unmounted');
      }
    };
  }, []);

  return {
    water,
    air,
    alerts: currentAlerts,
    pm25History,
    phHistory,
    loading,
    error,
  };
}
