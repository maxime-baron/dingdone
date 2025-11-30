export interface Interval {
  id: string;
  name: string;
  duration: number; // en secondes
  color?: string;
  sound?: string;
}

export interface Cycle {
  id: string;
  intervals: Interval[];
  repetitions: number;
  duration: number; // calculé automatiquement
}

export interface Session {
  id: string;
  name: string;
  cycles: Cycle[];
  totalDuration: number; // calculé automatiquement
  playCountdownSound?: boolean; // jouer un son les 3 dernières secondes
  createdAt: number;
  updatedAt: number;
}

export interface TimerState {
  sessionId: string;
  currentCycleIndex: number;
  currentIntervalIndex: number;
  currentCycleRepetition: number;
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  // Timestamp fields for background timer support
  startedAt: number | null; // Timestamp when timer started
  pausedAt: number | null; // Timestamp when timer was paused
  intervalStartedAt: number | null; // Timestamp when current interval started
  notificationsEnabled: boolean; // Whether notifications are granted
}
