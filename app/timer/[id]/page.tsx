"use client";

import { use, useEffect, useState } from "react";
import { Session } from "@/types/timer";
import { useSessions } from "@/hooks/use-sessions";
import { useTimer } from "@/hooks/use-timer";
import { TimerDisplay } from "@/components/timer-display";
import { TimerControls } from "@/components/timer-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  const {
    state: {
      currentCycleIndex,
      currentCycleRepetition,
      currentIntervalIndex,
      timeRemaining,
      isRunning,
      isPaused,
    },
    ...timer
  } = useTimer(session);

  const currentInterval = timer.getCurrentInterval();
  const CyclesProgress = timer.getCyclesProgress();

  return (
    <div className="min-h-screen bg-background">
      <header>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1 flex items-end justify-between">
              <h1 className="text-xl font-bold">{session.name}</h1>
              <Badge variant="outline">
                Cycle {currentCycleIndex + 1}/{session.cycles.length} • Rép{" "}
                {currentCycleRepetition + 1}/
                {session.cycles[currentCycleIndex]?.repetitions || 0}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex w-full gap-1">
          {session.cycles.map((cycle, idx) => (
            <Progress
              key={`${cycle.id}-progress-bar`}
              value={CyclesProgress[idx].progress}
              className={`h-0.5`}
              style={{
                width: `${
                  ((cycle.duration * cycle.repetitions) /
                    session.totalDuration) *
                  100
                }%`,
              }}
            />
          ))}
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 max-w-3xl">
        <div className="space-y-8">
          <div className="w-full flex justify-center gap-2">
            {session.cycles[currentCycleIndex]?.intervals.map(
              (interval, idx) => (
                <Badge
                  key={interval.id}
                  variant={idx === currentIntervalIndex ? "default" : "outline"}
                  className="text-md"
                  style={{
                    backgroundColor:
                      idx === currentIntervalIndex
                        ? interval.color || "#6b7280"
                        : undefined,
                    borderColor: interval.color || "#6b7280",
                  }}
                >
                  {interval.name}
                </Badge>
              )
            )}
          </div>

          <div className="flex justify-center">
            <TimerDisplay
              timeRemaining={timeRemaining}
              intervalName={currentInterval?.name || "En attente"}
              color={currentInterval?.color}
              isRunning={isRunning}
            />
          </div>

          <TimerControls
            isRunning={isRunning}
            isPaused={isPaused}
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
