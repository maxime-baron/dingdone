"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SessionCard } from "@/components/session-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getSessions, saveSession, deleteSession } from "@/lib/storage";
import { Session } from "@/types/timer";
import { getExampleSessions } from "@/lib/example-sessions";
import { generateId } from "@/lib/timer-utils";

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>(getSessions());
  const router = useRouter();

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    setSessions(getSessions());
  };

  const handleEditSession = (id: string) => {
    router.push(`/sessions/${id}/edit`);
  };

  const handleDuplicateSession = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (session) {
      const id = generateId();
      const duplicated = { ...session, id, name: `${session.name} (copie)` };
      saveSession(duplicated);
      setSessions(getSessions());
      router.replace(`#${id}`);
    }
  };

  // Load example sessions if none exist
  const displaySessions = sessions.length > 0 ? sessions : getExampleSessions();

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4 border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">DingDone</h1>
          <Button asChild size="lg">
            <Link href="/sessions/new">
              <Plus className="mr-2 h-5 w-5" />
              Nouvelle session
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {displaySessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onDelete={handleDeleteSession}
              onEdit={handleEditSession}
              onDuplicate={handleDuplicateSession}
            />
          ))}
        </div>

        {displaySessions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Aucune session créée. Commencez par en créer une !
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
