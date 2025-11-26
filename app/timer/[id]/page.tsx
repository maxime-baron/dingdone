"use client";

import { use, useEffect, useState } from "react";
import { Session } from "@/types/timer";
import { useSessions } from "@/hooks/use-sessions";
import { useTimer } from "@/hooks/use-timer";
import { TimerDisplay } from "@/components/timer-display";
import { TimerControls } from "@/components/timer-controls";
import { TimerProgress } from "@/components/timer-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TimerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getSession } = useSessions();
  const [session, setSession] = useState(() => getSession(id));

  useEffect(() => {
    setSession(getSession(id));
  }, [id, getSession]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <h2 className="text-xl font-semibold">Session introuvable</h2>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l&apos;accueil
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <TimerPageContent session={session} />;
}

function TimerPageContent({ session }: { session: Session }) {
  const timer = useTimer(session);

  const currentInterval = timer.getCurrentInterval();
  const progress = timer.getTotalProgress();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">{session.name}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 max-w-3xl">
        <div className="space-y-8">
          <TimerProgress
            session={session}
            currentCycleIndex={timer.state.currentCycleIndex}
            currentIntervalIndex={timer.state.currentIntervalIndex}
            currentCycleRepetition={timer.state.currentCycleRepetition}
            progress={progress}
          />

          <div className="flex justify-center">
            <TimerDisplay
              timeRemaining={timer.state.timeRemaining}
              intervalName={currentInterval?.name || "En attente"}
              color={currentInterval?.color}
              isRunning={timer.state.isRunning}
            />
          </div>

          <TimerControls
            isRunning={timer.state.isRunning}
            isPaused={timer.state.isPaused}
            onStart={timer.start}
            onPause={timer.pause}
            onResume={timer.resume}
            onReset={timer.reset}
            onSkip={timer.skip}
          />
        </div>
      </main>
    </div>
  );
}
