"use client";

import { useState } from "react";
import { SessionCard } from "@/components/session-card";
import { SessionForm } from "@/components/session-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { getSessions, saveSession, deleteSession } from "@/lib/storage";
import { Session } from "@/types/timer";
import { getExampleSessions } from "@/lib/example-sessions";

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>(getSessions());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | undefined>();

  const handleSaveSession = (session: Session) => {
    saveSession(session);
    setSessions(getSessions());
    setIsFormOpen(false);
    setEditingSession(undefined);
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    setSessions(getSessions());
  };

  const handleEditSession = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (session) {
      setEditingSession(session);
      setIsFormOpen(true);
    }
  };

  const handleDuplicateSession = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (session) {
      const duplicated = { ...session, id: `${Date.now()}`, name: `${session.name} (copie)` };
      saveSession(duplicated);
      setSessions(getSessions());
    }
  };

  const handleNewSession = () => {
    setEditingSession(undefined);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingSession(undefined);
  };

  // Load example sessions if none exist
  const displaySessions = sessions.length > 0 ? sessions : getExampleSessions();

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">DingDone</h1>
            <p className="text-muted-foreground mt-2">
              Gérez vos sessions de travail avec des intervalles personnalisés
            </p>
          </div>
          <Button onClick={handleNewSession} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Nouvelle session
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSession ? "Modifier la session" : "Nouvelle session"}
            </DialogTitle>
          </DialogHeader>
          <SessionForm
            initialSession={editingSession}
            onSave={handleSaveSession}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
