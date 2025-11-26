"use client";

import { formatTime } from "@/lib/timer-utils";
import { Card, CardContent } from "@/components/ui/card";

interface TimerDisplayProps {
  timeRemaining: number;
  intervalName: string;
  color?: string;
  isRunning: boolean;
}

export function TimerDisplay({
  timeRemaining,
  color = "#6b7280",
  isRunning,
}: TimerDisplayProps) {
  const isCompleted = !isRunning && timeRemaining === 0;
  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="flex flex-col items-center justify-center gap-6 p-0">
        <Card
          className="rounded-full w-64 h-64 sm:w-80 sm:h-80 shadow-2xl border-8 transition-colors"
          style={{ borderColor: color }}
        >
          <CardContent className="h-full flex flex-col items-center justify-center p-0">
            {isCompleted ? (
              <span className="text-6xl sm:text-7xl font-bold font-mono">
                Done
              </span>
            ) : (
              <span className="text-6xl sm:text-7xl font-bold font-mono tabular-nums">
                {formatTime(timeRemaining)}
              </span>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
