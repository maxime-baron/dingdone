"use client";

import { Session, Cycle, Interval } from "@/types/timer";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TimerProgressProps {
  session: Session;
  currentCycleIndex: number;
  currentIntervalIndex: number;
  currentCycleRepetition: number;
  progress: number;
}

export function TimerProgress({
  session,
  currentCycleIndex,
  currentIntervalIndex,
  currentCycleRepetition,
  progress,
}: TimerProgressProps) {
  const currentCycle = session.cycles[currentCycleIndex];

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{session.name}</span>
          <Badge variant="outline">
            Cycle {currentCycleIndex + 1}/{session.cycles.length} • Rép{" "}
            {currentCycleRepetition + 1}/{currentCycle?.repetitions || 0}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress value={progress} className="h-3" />

        {currentCycle?.intervals.map((interval, idx) => (
          <Badge
            key={interval.id}
            variant={idx === currentIntervalIndex ? "default" : "outline"}
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
        ))}
      </CardContent>
    </Card>
  );
}
