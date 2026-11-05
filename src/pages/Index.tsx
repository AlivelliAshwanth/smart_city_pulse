import { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import OverviewTab from '@/components/dashboard/OverviewTab';
import CityMap from '@/components/dashboard/CityMap';
import SensorTable from '@/components/dashboard/SensorTable';
import SensorChart from '@/components/dashboard/SensorChart';
import AlertFeed from '@/components/dashboard/AlertFeed';
import SimulationPanel from '@/components/dashboard/SimulationPanel';
import { useSensorData } from '@/hooks/useSensorData';
import type { TimeSeriesPoint } from '@/data/sensorData';
import { co2History as demoCo2History, turbidityHistory as demoTurbidityHistory } from '@/data/sensorData';
import { isDemoMode } from '@/demo/demoEngine';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Index = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { water, air, alerts, pm25History, phHistory, loading, error } = useSensorData();
  const [co2History, setCo2History] = useState<TimeSeriesPoint[]>([]);
  const [turbidityHistory, setTurbidityHistory] = useState<TimeSeriesPoint[]>([]);

  useEffect(() => {
    if (isDemoMode) {
      setCo2History(demoCo2History);
      setTurbidityHistory(demoTurbidityHistory);
      return;
    }

    // Fetch additional analytics data
    Promise.all([
      fetch(`${API_BASE_URL}/api/analytics/co2`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/analytics/turbidity`).then(res => res.json()),
    ]).then(([co2, turbidity]) => {
      setCo2History(co2);
      setTurbidityHistory(turbidity);
    }).catch(console.error);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab water={water} air={air} alerts={alerts} pm25History={pm25History} phHistory={phHistory} />;
      case 'map':
        return (
          <div className="h-[calc(100vh-7rem)]">
            <CityMap waterSensors={water} airSensors={air} />
          </div>
        );
      case 'water':
        return (
          <div className="space-y-4">
            <SensorTable waterSensors={water} airSensors={air} type="water" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SensorChart title="pH Levels" data={phHistory} color="hsl(185, 80%, 50%)" unit="" threshold={6.5} />
              <SensorChart title="Turbidity" data={turbidityHistory} color="hsl(38, 92%, 55%)" unit="NTU" />
            </div>
          </div>
        );
      case 'air':
        return (
          <div className="space-y-4">
            <SensorTable waterSensors={water} airSensors={air} type="air" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SensorChart title="PM2.5" data={pm25History} color="hsl(0, 72%, 55%)" unit="µg/m³" threshold={100} />
              <SensorChart title="CO₂" data={co2History} color="hsl(185, 80%, 50%)" unit="ppm" />
            </div>
          </div>
        );
      case 'alerts':
        return <AlertFeed alerts={alerts} />;
      case 'analytics':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SensorChart title="PM2.5 Trend" data={pm25History} color="hsl(185, 80%, 50%)" unit="µg/m³" threshold={100} />
            <SensorChart title="pH Trend" data={phHistory} color="hsl(142, 72%, 45%)" unit="" threshold={6.5} />
            <SensorChart title="CO₂ Trend" data={co2History} color="hsl(38, 92%, 55%)" unit="ppm" />
            <SensorChart title="Turbidity Trend" data={turbidityHistory} color="hsl(0, 72%, 55%)" unit="NTU" />
          </div>
        );
      case 'simulation':
        return (
          <div className="max-w-md">
            <SimulationPanel />
          </div>
        );
      default:
        return null;
    }
  };

  if (loading && water.length === 0 && air.length === 0) {
    return (
      <div className="flex h-screen w-full bg-background items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Loading sensor data...</div>
        </div>
      </div>
    );
  }

  if (error && water.length === 0 && air.length === 0) {
    return (
      <div className="flex h-screen w-full bg-background items-center justify-center">
        <div className="text-center">
          <div className="text-destructive mb-2">Error: {error}</div>
          <div className="text-sm text-muted-foreground">Make sure the backend server is running on port 3001</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        {isDemoMode && (
          <div role="status" className="px-4 py-1.5 text-xs text-muted-foreground bg-muted/40 border-b border-border">
            Demo: all readings are simulated in your browser, with no real sensors.{' '}
            <a
              href="https://github.com/AlivelliAshwanth/smart_city_pulse"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-2"
            >
              View on GitHub
            </a>
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-4">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
