import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { WaterSensor, AirSensor } from '@/data/sensorData';

interface CityMapProps {
  waterSensors: WaterSensor[];
  airSensors: AirSensor[];
}

const statusColor = {
  normal: '#22c55e',
  warning: '#eab308',
  critical: '#ef4444',
};

export default function CityMap({ waterSensors, airSensors }: CityMapProps) {
  return (
    <div className="glass-card rounded-xl overflow-hidden h-full min-h-[350px]">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">City Sensor Map</h3>
        <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" />Water</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning inline-block" />Air</span>
        </div>
      </div>
      <MapContainer
        center={[28.615, 77.215]}
        zoom={13}
        className="h-[calc(100%-40px)] w-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {waterSensors.map(s => (
          <CircleMarker
            key={s.id}
            center={[s.lat, s.lng]}
            radius={10}
            pathOptions={{ color: statusColor[s.status], fillColor: statusColor[s.status], fillOpacity: 0.6, weight: 2 }}
          >
            <Popup>
              <div className="text-xs space-y-1 min-w-[140px]">
                <p className="font-bold text-sm">{s.name}</p>
                <p>pH: {s.ph} | TDS: {s.tds}</p>
                <p>Turbidity: {s.turbidity} NTU</p>
                <p>Temp: {s.temperature}°C</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {airSensors.map(s => (
          <CircleMarker
            key={s.id}
            center={[s.lat, s.lng]}
            radius={10}
            pathOptions={{ color: statusColor[s.status], fillColor: statusColor[s.status], fillOpacity: 0.6, weight: 2, dashArray: '4' }}
          >
            <Popup>
              <div className="text-xs space-y-1 min-w-[140px]">
                <p className="font-bold text-sm">{s.name}</p>
                <p>PM2.5: {s.pm25} µg/m³</p>
                <p>CO₂: {s.co2} ppm | NO₂: {s.no2} ppb</p>
                <p>Humidity: {s.humidity}%</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
