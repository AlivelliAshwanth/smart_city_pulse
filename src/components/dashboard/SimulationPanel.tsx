import { useState } from 'react';
import { Play, Pause, RotateCcw, Zap, CloudRain, Factory } from 'lucide-react';
import { startSimulation, stopSimulation } from '@/services/simulationService';
import { demoEngine, isDemoMode } from '@/demo/demoEngine';
import { toast } from 'sonner';

const scenarios = [
  { id: 'pollution', label: 'Pollution Spike', icon: Factory, description: 'Simulate industrial emission surge in Zone A' },
  { id: 'flood', label: 'Flood Event', icon: CloudRain, description: 'Simulate heavy rainfall and water level rise' },
  { id: 'contamination', label: 'Water Contamination', icon: Zap, description: 'Simulate chemical spill in River Bend' },
];

export default function SimulationPanel() {
  // Stay in sync with the engine when this panel remounts after a tab change.
  const [running, setRunning] = useState(() => isDemoMode && demoEngine.isRunning());
  const [selected, setSelected] = useState('pollution');
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleStartStop = async () => {
    if (running) {
      // Stop simulation
      try {
        setLoading(true);
        await stopSimulation();
        setRunning(false);
        toast.success('Simulation stopped');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to stop simulation');
      } finally {
        setLoading(false);
      }
    } else {
      // Start simulation
      try {
        setLoading(true);
        await startSimulation(selected, speed);
        setRunning(true);
        toast.success(`Simulation started: ${scenarios.find(s => s.id === selected)?.label}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to start simulation');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      await stopSimulation();
      setRunning(false);
      toast.success('Simulation reset');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Disaster Simulation</h3>
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${running ? 'bg-success animate-pulse-glow' : 'bg-muted-foreground'}`} />
          <span className="text-[10px] font-mono text-muted-foreground">{running ? 'RUNNING' : 'IDLE'}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {scenarios.map(s => {
          const Icon = s.icon;
          const isActive = selected === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all border ${
                isActive ? 'border-primary/30 bg-primary/5' : 'border-transparent hover:bg-muted/30'
              }`}
            >
              <Icon className={`w-4 h-4 mt-0.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <p className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-mono text-muted-foreground">SPEED</span>
        <div className="flex gap-1">
          {[1, 2, 5, 10].map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-1 text-[10px] font-mono rounded ${
                speed === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleStartStop}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            running
              ? 'bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {loading ? 'Loading...' : running ? 'Pause' : 'Run Simulation'}
        </button>
        <button
          onClick={handleReset}
          disabled={loading}
          className="px-3 py-2.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
