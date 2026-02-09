import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Alert } from '@/data/sensorData';

interface AlertFeedProps {
  alerts: Alert[];
}

const severityConfig = {
  info: { icon: Info, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
  critical: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
};

export default function AlertFeed({ alerts }: AlertFeedProps) {
  return (
    <div className="glass-card rounded-xl p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Active Alerts</h3>
        <span className="text-[10px] font-mono bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
          {alerts.filter(a => a.severity === 'critical').length} critical
        </span>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {alerts.map((alert, i) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-3 p-3 rounded-lg border ${config.bg} ${config.border}`}
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground leading-relaxed">{alert.message}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-1">
                  {alert.type.toUpperCase()} · {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
