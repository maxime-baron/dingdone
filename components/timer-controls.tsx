"use client";

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
      <div className="flex gap-8 justify-center flex-wrap">
        {isRunning && (
          <button
            onClick={onReset}
            className="h-14 w-14 flex items-center justify-center"
          >
            <RotateCcw className="h-10 w-10" color="red" />
          </button>
        )}
        {!isRunning ? (
          <button
            onClick={onStart}
            className="h-14 w-14 flex items-center justify-center"
          >
            <Play className="h-10 w-10" />
          </button>
        ) : isPaused ? (
          <button
            onClick={onResume}
            className="h-14 w-14 flex items-center justify-center"
          >
            <Play className="h-10 w-10" color="green" />
          </button>
        ) : (
          <button
            onClick={onPause}
            className="h-14 w-14 flex items-center justify-center"
          >
            <Pause className="h-10 w-10" />
          </button>
        )}

        {isRunning && (
          <button
            onClick={onSkip}
            className="h-14 w-14 flex items-center justify-center"
          >
            <SkipForward className="h-10 w-10" />
          </button>
        )}
      </div>
    </div>
  );
}
