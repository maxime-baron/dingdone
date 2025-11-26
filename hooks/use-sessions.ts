"use client";

import { useState, useEffect, useCallback } from "react";
import { Session } from "@/types/timer";
import {
  getSessions,
  saveSession as saveSessionToStorage,
  deleteSession as deleteSessionFromStorage,
  duplicateSession as duplicateSessionInStorage,
} from "@/lib/storage";

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedSessions = getSessions();
    setSessions(loadedSessions);
    setIsLoading(false);
  }, []);

  const saveSession = useCallback((session: Session) => {
    saveSessionToStorage(session);
    setSessions(getSessions());
  }, []);

  const deleteSession = useCallback((id: string) => {
    deleteSessionFromStorage(id);
    setSessions(getSessions());
  }, []);

  const duplicateSession = useCallback((id: string) => {
    const duplicated = duplicateSessionInStorage(id);
    if (duplicated) {
      setSessions(getSessions());
    }
    return duplicated;
  }, []);

  const getSession = useCallback(
    (id: string) => {
      return sessions.find((s) => s.id === id);
    },
    [sessions]
  );

  return {
    sessions,
    isLoading,
    saveSession,
    deleteSession,
    duplicateSession,
    getSession,
  };
}
