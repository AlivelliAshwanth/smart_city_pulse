import { Droplets, Wind, Thermometer, Gauge } from 'lucide-react';
import type { WaterSensor, AirSensor } from '@/data/sensorData';

interface SensorTableProps {
  waterSensors: WaterSensor[];
  airSensors: AirSensor[];
  type: 'water' | 'air';
}

const statusBadge = {
  normal: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function SensorTable({ waterSensors, airSensors, type }: SensorTableProps) {
  if (type === 'water') {
    return (
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Droplets className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Water Quality Sensors</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-2.5 font-medium">Station</th>
                <th className="text-right px-4 py-2.5 font-medium">pH</th>
                <th className="text-right px-4 py-2.5 font-medium">Turbidity</th>
                <th className="text-right px-4 py-2.5 font-medium">TDS</th>
                <th className="text-right px-4 py-2.5 font-medium">Temp</th>
                <th className="text-center px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {waterSensors.map(s => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">{s.name}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{s.ph}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{s.turbidity} NTU</td>
                  <td className="px-4 py-2.5 text-right font-mono">{s.tds} ppm</td>
                  <td className="px-4 py-2.5 text-right font-mono">{s.temperature}°C</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase ${statusBadge[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Wind className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Air Quality Sensors</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left px-4 py-2.5 font-medium">Station</th>
              <th className="text-right px-4 py-2.5 font-medium">PM2.5</th>
              <th className="text-right px-4 py-2.5 font-medium">CO₂</th>
              <th className="text-right px-4 py-2.5 font-medium">NO₂</th>
              <th className="text-right px-4 py-2.5 font-medium">Humidity</th>
              <th className="text-center px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {airSensors.map(s => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2.5 font-medium text-foreground">{s.name}</td>
                <td className="px-4 py-2.5 text-right font-mono">{s.pm25} µg/m³</td>
                <td className="px-4 py-2.5 text-right font-mono">{s.co2} ppm</td>
                <td className="px-4 py-2.5 text-right font-mono">{s.no2} ppb</td>
                <td className="px-4 py-2.5 text-right font-mono">{s.humidity}%</td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase ${statusBadge[s.status]}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
