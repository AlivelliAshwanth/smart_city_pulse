import { Activity, Droplets, Wind, AlertTriangle, Map, BarChart3, Settings, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'map', label: 'City Map', icon: Map },
  { id: 'water', label: 'Water Quality', icon: Droplets },
  { id: 'air', label: 'Air Quality', icon: Wind },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'simulation', label: 'Simulation', icon: Radio },
];

export default function DashboardSidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-16 lg:w-56 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      <div className="p-3 lg:p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-sm font-bold text-foreground tracking-tight">City Pulse Live</h1>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Digital Twin v1.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative group
                ${isActive
                  ? 'bg-primary/10 text-primary glow-border'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/10 rounded-lg glow-border"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-primary' : ''}`} />
              <span className="hidden lg:inline relative z-10 font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-all">
          <Settings className="w-4 h-4" />
          <span className="hidden lg:inline">Settings</span>
        </button>
      </div>
    </aside>
  );
}
