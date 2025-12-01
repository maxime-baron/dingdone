"use client";

import { useState } from "react";
import { Session, Cycle, Interval } from "@/types/timer";
import {
  createInterval,
  createCycle,
  createSession,
  updateSessionDuration,
  INTERVAL_COLORS,
} from "@/lib/timer-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save } from "lucide-react";
import IntervalCard from "./interval-card";
import CycleCard from "./cycle-card";

interface SessionFormProps {
  initialSession?: Session;
  onSave: (session: Session) => void;
  onCancel: () => void;
}

export function SessionForm({
  initialSession,
  onSave,
  onCancel,
}: SessionFormProps) {
  const [name, setName] = useState(initialSession?.name || "");
  const [playCountdownSound, setPlayCountdownSound] = useState(
    initialSession?.playCountdownSound ?? false
  );
  const [cycles, setCycles] = useState<Cycle[]>(
    initialSession?.cycles || [
      createCycle(
        [createInterval("Intervalle 1", 90, INTERVAL_COLORS.work)],
        5
      ),
    ]
  );

  const addCycle = () => {
    setCycles([
      ...cycles,
      createCycle(
        [createInterval("Intervalle", 90, INTERVAL_COLORS.default)],
        5
      ),
    ]);
  };

  const removeCycle = (cycleIndex: number) => {
    setCycles(cycles.filter((_, idx) => idx !== cycleIndex));
  };

  const updateCycle = (cycleIndex: number, updates: Partial<Cycle>) => {
    setCycles(
      cycles.map((cycle, idx) =>
        idx === cycleIndex ? { ...cycle, ...updates } : cycle
      )
    );
  };

  const addInterval = (cycleIndex: number) => {
    const cycle = cycles[cycleIndex];
    const newInterval = createInterval(
      "Intervalle",
      90,
      INTERVAL_COLORS.default
    );

    updateCycle(cycleIndex, {
      intervals: [...cycle.intervals, newInterval],
    });
  };

  const removeInterval = (cycleIndex: number, intervalIndex: number) => {
    const cycle = cycles[cycleIndex];

    updateCycle(cycleIndex, {
      intervals: cycle.intervals.filter((_, idx) => idx !== intervalIndex),
    });
  };

  const updateInterval = (
    cycleIndex: number,
    intervalIndex: number,
    updates: Partial<Interval>
  ) => {
    const cycle = cycles[cycleIndex];
    updateCycle(cycleIndex, {
      intervals: cycle.intervals.map((interval, idx) =>
        idx === intervalIndex ? { ...interval, ...updates } : interval
      ),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let error = false;

    if (!name.trim()) {
      alert("Veuillez entrer un nom pour la session");
      return;
    }

    if (cycles.length === 0) {
      alert("Veuillez ajouter au moins un cycle");
      return;
    }

    cycles.forEach((cycle) => {
      cycle.intervals.forEach((interval, index) => {
        if (isNaN(interval.duration) || interval.duration === 0) {
          alert(`L'intervalle ${index + 1} n'a pas de durée`);
          error = true;
        }
      });
    });

    if (error) {
      return;
    }

    const session = initialSession
      ? updateSessionDuration({
          ...initialSession,
          name: name.trim(),
          cycles,
          playCountdownSound,
        })
      : {
          ...createSession(name.trim(), cycles),
          playCountdownSound,
        };

    onSave(session);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="gap-3">
        <CardHeader>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-name">Nom de la session</Label>
            <Input
              id="session-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pomodoro, HIIT Tabata..."
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="countdown-sound"
              checked={playCountdownSound}
              onCheckedChange={(checked) =>
                setPlayCountdownSound(checked === true)
              }
            />
            <Label
              htmlFor="countdown-sound"
              className="text-sm font-normal cursor-pointer"
            >
              Jouer un son chaque seconde les 3 dernières secondes
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {cycles.map((cycle, cycleIndex) => (
          <CycleCard
            key={cycleIndex}
            cycle={cycle}
            index={cycleIndex}
            cycleCount={cycles.length}
            onDelete={() => removeCycle(cycleIndex)}
            onUpdateRepetition={(repetitions) =>
              updateCycle(cycleIndex, {
                repetitions,
              })
            }
          >
            {cycle.intervals.map((interval, intervalIndex) => (
              <IntervalCard
                key={intervalIndex}
                interval={interval}
                cycleIndex={cycleIndex}
                index={intervalIndex}
                intervalCount={cycle.intervals.length}
                onDelete={() => removeInterval(cycleIndex, intervalIndex)}
                onUpdateName={(name) =>
                  updateInterval(cycleIndex, intervalIndex, { name })
                }
                onUpdateTime={(duration) =>
                  updateInterval(cycleIndex, intervalIndex, { duration })
                }
                onUpdateColor={(color) =>
                  updateInterval(cycleIndex, intervalIndex, { color })
                }
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addInterval(cycleIndex)}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un intervalle
            </Button>
          </CycleCard>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addCycle}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Ajouter un cycle
      </Button>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          Sauvegarder
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
