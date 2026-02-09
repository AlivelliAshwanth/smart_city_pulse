import { motion } from 'framer-motion';
import { Droplets, Wind, Thermometer, Gauge, Activity, AlertTriangle } from 'lucide-react';
import MetricCard from './MetricCard';
import SensorChart from './SensorChart';
import AlertFeed from './AlertFeed';
import SensorTable from './SensorTable';
import SimulationPanel from './SimulationPanel';
import CityMap from './CityMap';
import type { WaterSensor, AirSensor, Alert, TimeSeriesPoint } from '@/data/sensorData';

interface OverviewTabProps {
  water: WaterSensor[];
  air: AirSensor[];
  alerts: Alert[];
  pm25History: TimeSeriesPoint[];
  phHistory: TimeSeriesPoint[];
}

export default function OverviewTab({ water, air, alerts, pm25History, phHistory }: OverviewTabProps) {
  const avgPm25 = (air.reduce((sum, s) => sum + s.pm25, 0) / air.length).toFixed(0);
  const avgPh = (water.reduce((sum, s) => sum + s.ph, 0) / water.length).toFixed(1);
  const avgCo2 = (air.reduce((sum, s) => sum + s.co2, 0) / air.length).toFixed(0);
  const avgTemp = (water.reduce((sum, s) => sum + s.temperature, 0) / water.length).toFixed(1);
  const criticalCount = [...water, ...air].filter(s => s.status === 'critical').length;
  const totalSensors = water.length + air.length;

  return (
    <div className="space-y-4">
      {/* Metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard title="PM2.5 Avg" value={avgPm25} unit="µg/m³" icon={Wind} status={Number(avgPm25) > 100 ? 'critical' : Number(avgPm25) > 50 ? 'warning' : 'normal'} />
        <MetricCard title="Avg pH" value={avgPh} unit="" icon={Droplets} status={Number(avgPh) < 6.5 ? 'critical' : Number(avgPh) < 6.8 ? 'warning' : 'normal'} />
        <MetricCard title="CO₂ Avg" value={avgCo2} unit="ppm" icon={Gauge} status={Number(avgCo2) > 600 ? 'warning' : 'normal'} />
        <MetricCard title="Water Temp" value={avgTemp} unit="°C" icon={Thermometer} status="normal" />
        <MetricCard title="Active Nodes" value={totalSensors} unit="online" icon={Activity} status="normal" />
        <MetricCard title="Alerts" value={criticalCount} unit="critical" icon={AlertTriangle} status={criticalCount > 0 ? 'critical' : 'normal'} />
      </div>

      {/* Map + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-[400px]">
          <CityMap waterSensors={water} airSensors={air} />
        </div>
        <AlertFeed alerts={alerts} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SensorChart title="PM2.5 Levels" data={pm25History} color="hsl(185, 80%, 50%)" unit="µg/m³" threshold={100} />
        <SensorChart title="Water pH" data={phHistory} color="hsl(142, 72%, 45%)" unit="" threshold={6.5} />
      </div>

      {/* Tables + Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <SensorTable waterSensors={water} airSensors={air} type="water" />
          <SensorTable waterSensors={water} airSensors={air} type="air" />
        </div>
        <SimulationPanel />
      </div>
    </div>
  );
}
