import { Session, TimerState } from "@/types/timer";
import { getExampleSessions } from "./example-sessions";

const STORAGE_KEY = "dingdone-sessions";
const INIT_KEY = "dingdone-initialized";
const TIMER_STATE_KEY = "dingdone-active-timer";
const NOTIFICATION_PERM_KEY = "dingdone-notifications-enabled";
const WAKE_LOCK_PREF_KEY = "dingdone-wake-lock-enabled";

export function getSessions(): Session[] {
  if (typeof window === "undefined") return [];

  try {
    // Vérifier si c'est la première utilisation
    const isInitialized = localStorage.getItem(INIT_KEY);

    const stored = localStorage.getItem(STORAGE_KEY);
    const sessions = stored ? JSON.parse(stored) : [];

    // Si pas encore initialisé et aucune session, ajouter les exemples
    if (!isInitialized && sessions.length === 0) {
      const exampleSessions = getExampleSessions();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exampleSessions));
      localStorage.setItem(INIT_KEY, "true");
      return exampleSessions;
    }

    return sessions;
  } catch (error) {
    console.error("Error reading sessions from storage:", error);
    return [];
  }
}

export function saveSessions(sessions: Session[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving sessions to storage:", error);
  }
}

export function getSession(id: string): Session | undefined {
  return getSessions().find((session) => session.id === id);
}

export function saveSession(session: Session): void {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === session.id);

  const updatedSession = {
    ...session,
    updatedAt: Date.now(),
  };

  if (index >= 0) {
    sessions[index] = updatedSession;
  } else {
    sessions.push(updatedSession);
  }

  saveSessions(sessions);
}

export function deleteSession(id: string): void {
  const sessions = getSessions();
  const filtered = sessions.filter((s) => s.id !== id);
  saveSessions(filtered);
}

export function duplicateSession(id: string): Session | undefined {
  const session = getSession(id);
  if (!session) return undefined;

  const duplicated: Session = {
    ...session,
    id: Date.now().toString(36) + Math.random().toString(36).substring(2),
    name: `${session.name} (copie)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  saveSession(duplicated);
  return duplicated;
}

// Timer state persistence
export function saveTimerState(state: TimerState): void {
  if (typeof window === "undefined") return;

  try {
    // Only save if timer is running or paused
    if (state.isRunning || state.isPaused) {
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
    } else {
      // Clear saved state when timer is stopped/completed
      localStorage.removeItem(TIMER_STATE_KEY);
    }
  } catch (error) {
    console.error("Error saving timer state:", error);
  }
}

export function loadTimerState(): TimerState | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(TIMER_STATE_KEY);
    if (!stored) return null;

    return JSON.parse(stored) as TimerState;
  } catch (error) {
    console.error("Error loading timer state:", error);
    return null;
  }
}

export function clearTimerState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TIMER_STATE_KEY);
}

export function saveNotificationPermission(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIFICATION_PERM_KEY, JSON.stringify(enabled));
}

export function getNotificationPermission(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const stored = localStorage.getItem(NOTIFICATION_PERM_KEY);
    return stored ? JSON.parse(stored) : false;
  } catch {
    return false;
  }
}

export function saveWakeLockPreference(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WAKE_LOCK_PREF_KEY, JSON.stringify(enabled));
}

export function getWakeLockPreference(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const stored = localStorage.getItem(WAKE_LOCK_PREF_KEY);
    return stored ? JSON.parse(stored) : false;
  } catch {
    return false;
  }
}
