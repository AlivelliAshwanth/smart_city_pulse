import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TimeSeriesPoint } from '@/data/sensorData';

interface SensorChartProps {
  title: string;
  data: TimeSeriesPoint[];
  color: string;
  unit: string;
  threshold?: number;
}

export default function SensorChart({ title, data, color, unit, threshold }: SensorChartProps) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">24h</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'hsl(215 12% 50%)' }}
            axisLine={{ stroke: 'hsl(220 14% 18%)' }}
            tickLine={false}
            interval={5}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'hsl(215 12% 50%)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(220 18% 10%)',
              border: '1px solid hsl(220 14% 18%)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'hsl(200 20% 92%)',
            }}
            formatter={(value: number) => [`${value} ${unit}`, title]}
          />
          {threshold && (
            <Area
              type="monotone"
              dataKey={() => threshold}
              stroke="hsl(0 72% 55%)"
              strokeDasharray="4 4"
              fill="none"
              strokeWidth={1}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={`url(#gradient-${title})`}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
