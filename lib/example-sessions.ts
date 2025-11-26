import { Session } from "@/types/timer";
import {
  createSession,
  createCycle,
  createInterval,
  INTERVAL_COLORS,
} from "@/lib/timer-utils";

export function getExampleSessions(): Session[] {
  // Session HIIT personnalisée
  const hiitCustomSession = createSession("HIIT 30/15", [
    createCycle(
      [
        createInterval("Effort", 30, "#dc2626"),
        createInterval("Récup", 15, "#22c55e"),
      ],
      10
    ),
  ]);

  // Session Pomodoro avec pause longue
  const pomodoroWithLongBreak = createSession("Pomodoro", [
    createCycle(
      [
        createInterval("Travail", 25 * 60, INTERVAL_COLORS.work),
        createInterval("Pause", 5 * 60, INTERVAL_COLORS.rest),
      ],
      3
    ),
    createCycle(
      [
        createInterval("Travail", 25 * 60, INTERVAL_COLORS.work),
        createInterval("Pause longue", 15 * 60, INTERVAL_COLORS.cooldown),
      ],
      1
    ),
  ]);

  pomodoroWithLongBreak.id = "example-pomodoro-complet";
  hiitCustomSession.id = "example-hiit-30-15";

  return [hiitCustomSession, pomodoroWithLongBreak];
}
