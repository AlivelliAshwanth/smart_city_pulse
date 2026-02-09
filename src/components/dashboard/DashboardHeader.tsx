import { Bell, Search, Wifi } from 'lucide-react';

export default function DashboardHeader() {
  return (
    <header className="h-12 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
          <span className="text-xs font-mono text-success uppercase tracking-wider">Live</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sensors..."
            className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-40"
          />
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Wifi className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-mono">10 nodes</span>
        </div>
        <button className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
        </button>
      </div>
    </header>
  );
}
