import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  status: 'normal' | 'warning' | 'critical';
  change?: string;
}

const statusColors = {
  normal: 'text-success',
  warning: 'text-warning',
  critical: 'text-destructive',
};

const statusGlow = {
  normal: 'shadow-[0_0_15px_hsl(var(--success)/0.15)]',
  warning: 'shadow-[0_0_15px_hsl(var(--warning)/0.15)]',
  critical: 'shadow-[0_0_15px_hsl(var(--destructive)/0.15)]',
};

export default function MetricCard({ title, value, unit, icon: Icon, status, change }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card rounded-xl p-4 ${statusGlow[status]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${statusColors[status]}`} />
          </div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{title}</span>
        </div>
        <div className={`w-2 h-2 rounded-full ${status === 'normal' ? 'bg-success' : status === 'warning' ? 'bg-warning' : 'bg-destructive'} animate-pulse-glow`} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold font-mono data-readout text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground font-mono">{unit}</span>
      </div>
      {change && (
        <p className="text-xs text-muted-foreground mt-1">{change}</p>
      )}
    </motion.div>
  );
}
