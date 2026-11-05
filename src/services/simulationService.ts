import { demoEngine, isDemoMode, type Scenario } from '@/demo/demoEngine';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface SimulationRequest {
  scenario: 'pollution' | 'flood' | 'contamination';
  speed: number;
}

export async function startSimulation(scenario: string, speed: number): Promise<void> {
  if (isDemoMode) {
    demoEngine.startSimulation(scenario as Scenario, speed);
    return;
  }

  const response = await fetch(`${API_BASE_URL}/api/simulation/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ scenario, speed }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to start simulation');
  }
}

export async function stopSimulation(): Promise<void> {
  if (isDemoMode) {
    demoEngine.stopSimulation();
    return;
  }

  const response = await fetch(`${API_BASE_URL}/api/simulation/stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to stop simulation');
  }
}
