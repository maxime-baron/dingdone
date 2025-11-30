import { Session, Cycle, Interval, TimerState } from "@/types/timer";

export function calculateCycleDuration(cycle: Cycle): number {
  return cycle.intervals.reduce((sum, interval) => sum + interval.duration, 0);
}

export function calculateSessionTotalDuration(session: Session): number {
  return session.cycles.reduce((sum, cycle) => {
    const cycleDuration = calculateCycleDuration(cycle);
    return sum + cycleDuration * cycle.repetitions;
  }, 0);
}

export function updateCycleDuration(cycle: Cycle): Cycle {
  return {
    ...cycle,
    duration: calculateCycleDuration(cycle),
  };
}

export function updateSessionDuration(session: Session): Session {
  return {
    ...session,
    cycles: session.cycles.map(updateCycleDuration),
    totalDuration: calculateSessionTotalDuration(session),
  };
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function formatTimeVerbose(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}min`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function createInterval(
  name: string,
  duration: number,
  color?: string,
  sound?: string
): Interval {
  return {
    id: generateId(),
    name,
    duration,
    color,
    sound,
  };
}

export function createCycle(
  intervals: Interval[],
  repetitions: number = 1
): Cycle {
  const cycle: Cycle = {
    id: generateId(),
    intervals,
    repetitions,
    duration: 0,
  };
  return updateCycleDuration(cycle);
}

export function createSession(name: string, cycles: Cycle[]): Session {
  const session: Session = {
    id: generateId(),
    name,
    cycles,
    totalDuration: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  return updateSessionDuration(session);
}

// Couleurs prédéfinies pour les intervalles
export const INTERVAL_COLORS = {
  work: "#ef4444", // red
  rest: "#10b981", // green
  preparation: "#f59e0b", // amber
  cooldown: "#3b82f6", // blue
  default: "#6b7280", // gray
} as const;

// ============================================
// TIMESTAMP-BASED TIMER FUNCTIONS
// ============================================

/**
 * Calculate time remaining in current interval based on timestamps
 */
export function calculateTimeRemaining(
  state: TimerState,
  intervalDuration: number
): number {
  if (!state.intervalStartedAt) return intervalDuration;

  const now = Date.now();
  const elapsed =
    state.isPaused && state.pausedAt
      ? (state.pausedAt - state.intervalStartedAt) / 1000
      : (now - state.intervalStartedAt) / 1000;

  const remaining = Math.max(0, intervalDuration - Math.floor(elapsed));
  return remaining;
}

/**
 * Recover timer state after app was closed
 * Returns null if timer has completed, or updated state with current position
 */
export function recoverTimerState(
  savedState: TimerState,
  session: Session
): TimerState | null {
  if (!savedState.isRunning || savedState.isPaused) {
    return savedState; // Return as-is if paused or stopped
  }

  if (!savedState.intervalStartedAt) {
    return savedState; // No timestamp, can't recover
  }

  const now = Date.now();
  const elapsedMs = now - savedState.intervalStartedAt;
  let remainingSeconds = Math.floor(elapsedMs / 1000);

  let currentCycleIndex = savedState.currentCycleIndex;
  let currentIntervalIndex = savedState.currentIntervalIndex;
  let currentCycleRepetition = savedState.currentCycleRepetition;

  // Navigate through intervals to find current position
  while (remainingSeconds > 0) {
    const currentCycle = session.cycles[currentCycleIndex];
    if (!currentCycle) {
      // Timer has completed
      return null;
    }

    const currentInterval = currentCycle.intervals[currentIntervalIndex];
    if (!currentInterval) {
      // Move to next cycle or repetition
      currentIntervalIndex = 0;
      currentCycleRepetition++;

      if (currentCycleRepetition >= currentCycle.repetitions) {
        currentCycleRepetition = 0;
        currentCycleIndex++;

        if (currentCycleIndex >= session.cycles.length) {
          return null; // Completed
        }
      }
      continue;
    }

    if (remainingSeconds < currentInterval.duration) {
      // Still in this interval
      return {
        ...savedState,
        currentCycleIndex,
        currentIntervalIndex,
        currentCycleRepetition,
        timeRemaining: currentInterval.duration - remainingSeconds,
        intervalStartedAt: now - remainingSeconds * 1000,
      };
    }

    // Move to next interval
    remainingSeconds -= currentInterval.duration;
    currentIntervalIndex++;

    if (currentIntervalIndex >= currentCycle.intervals.length) {
      currentIntervalIndex = 0;
      currentCycleRepetition++;

      if (currentCycleRepetition >= currentCycle.repetitions) {
        currentCycleRepetition = 0;
        currentCycleIndex++;
      }
    }
  }

  // If we're here, we're at the exact end of an interval
  return {
    ...savedState,
    currentCycleIndex,
    currentIntervalIndex,
    currentCycleRepetition,
    intervalStartedAt: now,
  };
}

/**
 * Get all upcoming transitions for pre-scheduling notifications
 * Returns array of { delay: ms, type: 'interval'|'cycle'|'session', name: string }
 */
export function getUpcomingTransitions(
  session: Session,
  state: TimerState
): Array<{
  delay: number;
  type: "interval" | "cycle" | "session";
  name: string;
}> {
  const transitions: Array<{
    delay: number;
    type: "interval" | "cycle" | "session";
    name: string;
  }> = [];

  let accumulatedTime = state.timeRemaining; // Start from current remaining time
  let cycleIndex = state.currentCycleIndex;
  let intervalIndex = state.currentIntervalIndex;
  let repetition = state.currentCycleRepetition;

  const MAX_TRANSITIONS = 100; // Safety limit
  let transitionCount = 0;

  while (transitionCount < MAX_TRANSITIONS) {
    // Move to next interval
    intervalIndex++;

    const cycle = session.cycles[cycleIndex];
    if (!cycle) break; // No more cycles

    if (intervalIndex >= cycle.intervals.length) {
      // End of cycle intervals
      repetition++;

      if (repetition >= cycle.repetitions) {
        // Cycle complete, move to next cycle
        cycleIndex++;

        if (cycleIndex >= session.cycles.length) {
          // Session complete
          transitions.push({
            delay: accumulatedTime * 1000,
            type: "session",
            name: "Session terminée",
          });
          break;
        }

        // Next cycle
        const nextCycle = session.cycles[cycleIndex];
        transitions.push({
          delay: accumulatedTime * 1000,
          type: "cycle",
          name: `Nouveau cycle : ${nextCycle.intervals[0].name}`,
        });

        intervalIndex = 0;
        repetition = 0;
        accumulatedTime += nextCycle.intervals[0].duration;
      } else {
        // Repeat cycle
        intervalIndex = 0;
        const nextInterval = cycle.intervals[intervalIndex];
        transitions.push({
          delay: accumulatedTime * 1000,
          type: "interval",
          name: nextInterval.name,
        });
        accumulatedTime += nextInterval.duration;
      }
    } else {
      // Next interval in same cycle
      const nextInterval = cycle.intervals[intervalIndex];
      transitions.push({
        delay: accumulatedTime * 1000,
        type: "interval",
        name: nextInterval.name,
      });
      accumulatedTime += nextInterval.duration;
    }

    transitionCount++;
  }

  return transitions;
}
