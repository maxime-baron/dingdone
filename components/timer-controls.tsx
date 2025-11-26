"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export function TimerControls({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkip,
}: TimerControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-3 justify-center flex-wrap">
      {!isRunning ? (
        <Button
          onClick={onStart}
          size="lg"
          className="px-8 py-6 text-lg"
        >
          <Play className="mr-2 h-5 w-5" />
          Démarrer
        </Button>
      ) : isPaused ? (
        <Button
          onClick={onResume}
          size="lg"
          className="px-8 py-6 text-lg bg-green-600 hover:bg-green-700"
        >
          <Play className="mr-2 h-5 w-5" />
          Reprendre
        </Button>
      ) : (
        <Button
          onClick={onPause}
          size="lg"
          variant="secondary"
          className="px-8 py-6 text-lg"
        >
          <Pause className="mr-2 h-5 w-5" />
          Pause
        </Button>
      )}

      {isRunning && (
        <>
          <Button
            onClick={onSkip}
            size="lg"
            variant="outline"
            className="px-6 py-6"
          >
            <SkipForward className="mr-2 h-5 w-5" />
            Passer
          </Button>
          <Button
            onClick={onReset}
            size="lg"
            variant="destructive"
            className="px-6 py-6"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Réinitialiser
          </Button>
        </>
      )}
      </div>
    </div>
  );
}
