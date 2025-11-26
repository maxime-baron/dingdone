import { Session } from "@/types/timer";
import {
  createSession,
  createCycle,
  createInterval,
  INTERVAL_COLORS,
} from "@/lib/timer-utils";

export function getExampleSessions(): Session[] {
  // Session Pomodoro classique
  const pomodoroSession = createSession("Pomodoro", [
    createCycle(
      [
        createInterval("Travail", 25 * 60, INTERVAL_COLORS.work),
        createInterval("Pause courte", 5 * 60, INTERVAL_COLORS.rest),
      ],
      4
    ),
  ]);

  // Session HIIT Tabata
  const tabataSession = createSession("HIIT Tabata", [
    createCycle(
      [
        createInterval("Exercice", 20, "#ef4444"),
        createInterval("Repos", 10, "#10b981"),
      ],
      8
    ),
  ]);

  // Session Pomodoro longue
  const pomodoroLongSession = createSession("Pomodoro Long", [
    createCycle(
      [
        createInterval("Travail", 50 * 60, INTERVAL_COLORS.work),
        createInterval("Pause", 10 * 60, INTERVAL_COLORS.rest),
      ],
      3
    ),
  ]);

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

  // Session boxe d'entraînement
  const boxingSession = createSession("Boxe - Rounds", [
    createCycle(
      [
        createInterval("Préparation", 10, INTERVAL_COLORS.preparation),
        createInterval("Round", 3 * 60, "#f59e0b"),
        createInterval("Repos", 60, INTERVAL_COLORS.rest),
      ],
      5
    ),
  ]);

  // Session Pomodoro avec pause longue
  const pomodoroWithLongBreak = createSession("Pomodoro Complet", [
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

  return [
    pomodoroSession,
    tabataSession,
    pomodoroLongSession,
    hiitCustomSession,
    boxingSession,
    pomodoroWithLongBreak,
  ];
}
