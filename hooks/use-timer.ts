"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Session, TimerState, Cycle, Interval } from "@/types/timer";
import {
  playIntervalTransition,
  playCycleComplete,
  playSessionComplete,
  playCountdownBeep,
  initAudio,
} from "@/lib/audio";
import {
  saveTimerState,
  loadTimerState,
  clearTimerState,
  getNotificationPermission,
  saveNotificationPermission,
} from "@/lib/storage";
import {
  calculateTimeRemaining,
  recoverTimerState,
  getUpcomingTransitions,
} from "@/lib/timer-utils";
import {
  sendNotificationViaServiceWorker,
  requestNotificationPermission,
  cancelAllNotifications,
} from "@/lib/notifications";

export function useTimer(session: Session) {
  // Load saved state or create initial state
  const [state, setState] = useState<TimerState>(() => {
    // Try to recover saved state
    const saved = loadTimerState();

    if (saved && saved.sessionId === session.id) {
      // Attempt recovery
      const recovered = recoverTimerState(saved, session);

      if (recovered) {
        return recovered;
      }
    }

    // Default initial state
    const firstInterval = session.cycles[0].intervals[0];
    return {
      sessionId: session.id,
      currentCycleIndex: 0,
      currentIntervalIndex: 0,
      currentCycleRepetition: 0,
      timeRemaining: firstInterval.duration,
      isRunning: false,
      isPaused: false,
      startedAt: null,
      pausedAt: null,
      intervalStartedAt: null,
      notificationsEnabled: getNotificationPermission(),
    };
  });

  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCountdownSecond = useRef<number>(-1);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced save to localStorage
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveTimerState(state);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Save immediately on unmount
      saveTimerState(state);
    };
  }, [state]);

  // Request notification permission on mount
  useEffect(() => {
    if (!state.notificationsEnabled) {
      requestNotificationPermission().then((granted) => {
        if (granted) {
          saveNotificationPermission(true);
          setState((prev) => ({ ...prev, notificationsEnabled: true }));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Visibility change handler: reschedule notifications when app visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && state.isRunning && !state.isPaused) {
        // App became visible: cancel all pending notifications
        cancelAllNotifications();

        // Recalculate timer position based on timestamps (for iOS where JS pauses in background)
        const recovered = recoverTimerState(state, session);

        if (recovered) {
          // Timer is still running, update to recovered position
          setState(recovered);
        } else {
          // Timer has completed while app was in background
          clearTimerState();
          const firstInterval = session.cycles[0].intervals[0];
          setState({
            ...state,
            currentCycleIndex: 0,
            currentIntervalIndex: 0,
            currentCycleRepetition: 0,
            isRunning: false,
            isPaused: false,
            timeRemaining: firstInterval.duration,
            startedAt: null,
            pausedAt: null,
            intervalStartedAt: null,
          });
        }
      } else if (document.visibilityState === "hidden" && state.isRunning && !state.isPaused) {
        // App became hidden: schedule notifications for upcoming transitions
        const transitions = getUpcomingTransitions(session, state);
        transitions.forEach((transition) => {
          const title =
            transition.type === "session"
              ? "✅ Session terminée !"
              : transition.type === "cycle"
              ? "🔄 Nouveau cycle"
              : "⏱️ Nouvel intervalle";

          const body =
            transition.type === "session"
              ? "Tous les cycles sont terminés"
              : transition.name;

          sendNotificationViaServiceWorker(title, body, transition.delay);
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [state, session]);

  const getCurrentCycle = useCallback((): Cycle | null => {
    return session.cycles[state.currentCycleIndex] || null;
  }, [session, state.currentCycleIndex]);

  const getCurrentInterval = useCallback((): Interval | null => {
    const cycle = getCurrentCycle();
    if (!cycle) return null;
    return cycle.intervals[state.currentIntervalIndex] || null;
  }, [getCurrentCycle, state.currentIntervalIndex]);

  const getTotalProgress = useCallback((): number => {
    let totalElapsed = 0;

    // Cycles completely finished
    for (let i = 0; i < state.currentCycleIndex; i++) {
      const cycle = session.cycles[i];
      const cycleDuration = cycle.intervals.reduce(
        (sum, int) => sum + int.duration,
        0
      );
      totalElapsed += cycleDuration * cycle.repetitions;
    }

    // Current cycle
    const currentCycle = getCurrentCycle();
    if (currentCycle) {
      const cycleDuration = currentCycle.intervals.reduce(
        (sum, int) => sum + int.duration,
        0
      );
      totalElapsed += cycleDuration * state.currentCycleRepetition;

      // Completed intervals in current repetition
      for (let i = 0; i < state.currentIntervalIndex; i++) {
        totalElapsed += currentCycle.intervals[i].duration;
      }

      // Current interval
      const currentInterval = getCurrentInterval();
      if (currentInterval) {
        totalElapsed += currentInterval.duration - state.timeRemaining;
      }
    }

    return (totalElapsed / session.totalDuration) * 100;
  }, [session, state, getCurrentCycle, getCurrentInterval]);

  const playSound = useCallback(
    (type: "interval" | "cycle" | "session" = "interval") => {
      // Only play sounds if app is visible (user is looking at the app)
      if (document.visibilityState !== "visible") {
        // Don't play custom sounds when backgrounded - notifications will be sent instead
        return;
      }

      if (type === "session") {
        playSessionComplete();
      } else if (type === "cycle") {
        playCycleComplete();
      } else {
        playIntervalTransition();
      }
    },
    []
  );

  const moveToNextInterval = useCallback(() => {
    setState((prev) => {
      const currentCycle = session.cycles[prev.currentCycleIndex];
      if (!currentCycle) return prev;

      const nextIntervalIndex = prev.currentIntervalIndex + 1;
      const now = Date.now();

      // End of cycle intervals
      if (nextIntervalIndex >= currentCycle.intervals.length) {
        const nextRepetition = prev.currentCycleRepetition + 1;

        // End of cycle repetitions
        if (nextRepetition >= currentCycle.repetitions) {
          const nextCycleIndex = prev.currentCycleIndex + 1;

          // End of all cycles (session complete)
          if (nextCycleIndex >= session.cycles.length) {
            playSound("session");
            clearTimerState();

            return {
              ...prev,
              currentCycleIndex: 0,
              currentIntervalIndex: 0,
              currentCycleRepetition: 0,
              isRunning: false,
              isPaused: false,
              timeRemaining: 0,
              startedAt: null,
              pausedAt: null,
              intervalStartedAt: null,
            };
          }

          // Move to next cycle
          const nextCycle = session.cycles[nextCycleIndex];
          const nextInterval = nextCycle.intervals[0];
          playSound("cycle");

          return {
            ...prev,
            currentCycleIndex: nextCycleIndex,
            currentIntervalIndex: 0,
            currentCycleRepetition: 0,
            timeRemaining: nextInterval.duration,
            intervalStartedAt: now,
          };
        }

        // Repeat cycle
        const nextInterval = currentCycle.intervals[0];
        playSound("interval");

        return {
          ...prev,
          currentIntervalIndex: 0,
          currentCycleRepetition: nextRepetition,
          timeRemaining: nextInterval.duration,
          intervalStartedAt: now,
        };
      }

      // Move to next interval in cycle
      const nextInterval = currentCycle.intervals[nextIntervalIndex];
      playSound("interval");

      return {
        ...prev,
        currentIntervalIndex: nextIntervalIndex,
        timeRemaining: nextInterval.duration,
        intervalStartedAt: now,
      };
    });
  }, [session, playSound]);

  const start = useCallback(() => {
    // Unlock audio on iOS (requires user interaction)
    initAudio();

    setState((prev) => {
      if (prev.isRunning) return prev;

      const now = Date.now();
      const currentInterval = session.cycles[prev.currentCycleIndex].intervals[prev.currentIntervalIndex];

      const newState = {
        ...prev,
        isRunning: true,
        isPaused: false,
        startedAt: now,
        intervalStartedAt: now,
        pausedAt: null,
        timeRemaining: prev.timeRemaining || currentInterval.duration,
      };

      // Schedule notifications only if app is hidden at start
      setTimeout(() => {
        if (document.visibilityState === "hidden") {
          const transitions = getUpcomingTransitions(session, newState);
          transitions.forEach((transition) => {
            const title =
              transition.type === "session"
                ? "✅ Session terminée !"
                : transition.type === "cycle"
                ? "🔄 Nouveau cycle"
                : "⏱️ Nouvel intervalle";

            const body =
              transition.type === "session"
                ? "Tous les cycles sont terminés"
                : transition.name;

            sendNotificationViaServiceWorker(title, body, transition.delay);
          });
        }
      }, 100);

      return newState;
    });
  }, [session]);

  const pause = useCallback(() => {
    // Cancel all pending notifications
    cancelAllNotifications();

    setState((prev) => {
      const now = Date.now();
      return {
        ...prev,
        isPaused: true,
        pausedAt: now,
      };
    });
  }, []);

  const resume = useCallback(() => {
    // Unlock audio on iOS (requires user interaction)
    initAudio();

    setState((prev) => {
      const now = Date.now();
      const pauseDuration = prev.pausedAt ? now - prev.pausedAt : 0;

      const newState = {
        ...prev,
        isPaused: false,
        pausedAt: null,
        startedAt: (prev.startedAt || now) + pauseDuration,
        intervalStartedAt: (prev.intervalStartedAt || now) + pauseDuration,
      };

      // Reschedule notifications only if app is hidden
      setTimeout(() => {
        if (document.visibilityState === "hidden") {
          const transitions = getUpcomingTransitions(session, newState);
          transitions.forEach((transition) => {
            const title =
              transition.type === "session"
                ? "✅ Session terminée !"
                : transition.type === "cycle"
                ? "🔄 Nouveau cycle"
                : "⏱️ Nouvel intervalle";

            const body =
              transition.type === "session"
                ? "Tous les cycles sont terminés"
                : transition.name;

            sendNotificationViaServiceWorker(title, body, transition.delay);
          });
        }
      }, 100);

      return newState;
    });
  }, [session]);

  const reset = useCallback(() => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
    }

    // Cancel all pending notifications
    cancelAllNotifications();
    clearTimerState();

    const firstCycle = session.cycles[0];
    const firstInterval = firstCycle.intervals[0];

    setState({
      sessionId: session.id,
      currentCycleIndex: 0,
      currentIntervalIndex: 0,
      currentCycleRepetition: 0,
      timeRemaining: firstInterval.duration,
      isRunning: false,
      isPaused: false,
      startedAt: null,
      pausedAt: null,
      intervalStartedAt: null,
      notificationsEnabled: state.notificationsEnabled,
    });
  }, [session, state.notificationsEnabled]);

  const skip = useCallback(() => {
    // Unlock audio on iOS (requires user interaction)
    initAudio();

    // Cancel all pending notifications and reschedule
    cancelAllNotifications();

    moveToNextInterval();

    // Reschedule notifications only if app is hidden
    setTimeout(() => {
      setState((prev) => {
        if (document.visibilityState === "hidden") {
          // Reschedule based on new state
          const transitions = getUpcomingTransitions(session, prev);
          transitions.forEach((transition) => {
            const title =
              transition.type === "session"
                ? "✅ Session terminée !"
                : transition.type === "cycle"
                ? "🔄 Nouveau cycle"
                : "⏱️ Nouvel intervalle";

            const body =
              transition.type === "session"
                ? "Tous les cycles sont terminés"
                : transition.name;

            sendNotificationViaServiceWorker(title, body, transition.delay);
          });
        }

        return prev; // Don't change state, just reschedule
      });
    }, 200);
  }, [moveToNextInterval, session]);


  // Timer tick effect (runs every 100ms for smooth UI updates)
  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      tickIntervalRef.current = setInterval(() => {
        setState((prev) => {
          const currentInterval = getCurrentInterval();
          if (!currentInterval) return prev;

          // Calculate time remaining based on timestamps
          const newTimeRemaining = calculateTimeRemaining(
            prev,
            currentInterval.duration
          );

          // Check if interval is complete
          if (newTimeRemaining <= 0) {
            // Move to next interval
            const currentCycle = session.cycles[prev.currentCycleIndex];
            if (!currentCycle) return prev;

            const nextIntervalIndex = prev.currentIntervalIndex + 1;
            const now = Date.now();

            // End of cycle intervals
            if (nextIntervalIndex >= currentCycle.intervals.length) {
              const nextRepetition = prev.currentCycleRepetition + 1;

              // End of cycle repetitions
              if (nextRepetition >= currentCycle.repetitions) {
                const nextCycleIndex = prev.currentCycleIndex + 1;

                // End of all cycles
                if (nextCycleIndex >= session.cycles.length) {
                  playSound("session");
                  clearTimerState();

                  return {
                    ...prev,
                    currentCycleIndex: 0,
                    currentIntervalIndex: 0,
                    currentCycleRepetition: 0,
                    isRunning: false,
                    isPaused: false,
                    timeRemaining: 0,
                    startedAt: null,
                    pausedAt: null,
                    intervalStartedAt: null,
                  };
                }

                // Move to next cycle
                const nextCycle = session.cycles[nextCycleIndex];
                const nextInterval = nextCycle.intervals[0];
                playSound("cycle");

                return {
                  ...prev,
                  currentCycleIndex: nextCycleIndex,
                  currentIntervalIndex: 0,
                  currentCycleRepetition: 0,
                  timeRemaining: nextInterval.duration,
                  intervalStartedAt: now,
                };
              }

              // Repeat cycle
              const nextInterval = currentCycle.intervals[0];
              playSound("interval");

              return {
                ...prev,
                currentIntervalIndex: 0,
                currentCycleRepetition: nextRepetition,
                timeRemaining: nextInterval.duration,
                intervalStartedAt: now,
              };
            }

            // Move to next interval in cycle
            const nextInterval = currentCycle.intervals[nextIntervalIndex];
            playSound("interval");

            return {
              ...prev,
              currentIntervalIndex: nextIntervalIndex,
              timeRemaining: nextInterval.duration,
              intervalStartedAt: now,
            };
          }

          // Play countdown beep (only if app is visible)
          if (
            session.playCountdownSound &&
            newTimeRemaining > 0 &&
            newTimeRemaining <= 3
          ) {
            if (Math.floor(newTimeRemaining) !== lastCountdownSecond.current) {
              lastCountdownSecond.current = Math.floor(newTimeRemaining);
              if (document.visibilityState === "visible") {
                playCountdownBeep();
              }
            }
          }

          return {
            ...prev,
            timeRemaining: newTimeRemaining,
          };
        });
      }, 100); // Update every 100ms for smooth display

      return () => {
        if (tickIntervalRef.current) {
          clearInterval(tickIntervalRef.current);
        }
      };
    } else {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    }
  }, [state.isRunning, state.isPaused, session, getCurrentInterval, playSound]);

  return {
    state,
    getCurrentCycle,
    getCurrentInterval,
    getTotalProgress,
    start,
    pause,
    resume,
    reset,
    skip,
  };
}
