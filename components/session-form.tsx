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
import { Plus, Trash2, Save } from "lucide-react";

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
      createCycle([createInterval("Travail", 1500, INTERVAL_COLORS.work)], 1),
    ]
  );

  const addCycle = () => {
    setCycles([
      ...cycles,
      createCycle(
        [createInterval("Intervalle", 60, INTERVAL_COLORS.default)],
        1
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
      60,
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

    if (!name.trim()) {
      alert("Veuillez entrer un nom pour la session");
      return;
    }

    if (cycles.length === 0) {
      alert("Veuillez ajouter au moins un cycle");
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
          <CardTitle>Informations de base</CardTitle>
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
          <Card key={cycle.id} className=" gap-3">
            <CardHeader className="h-8">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Cycle {cycleIndex + 1}
                </CardTitle>
                {cycles.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => removeCycle(cycleIndex)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`cycle-${cycleIndex}-repetitions`}>
                  Nombre de répétitions
                </Label>
                <Input
                  id={`cycle-${cycleIndex}-repetitions`}
                  type="number"
                  min="1"
                  value={cycle.repetitions}
                  onChange={(e) =>
                    updateCycle(cycleIndex, {
                      repetitions: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>

              <div className="space-y-3">
                <Label>Intervalles</Label>
                {cycle.intervals.map((interval, intervalIndex) => (
                  <Card key={interval.id} className="bg-muted/50">
                    <CardContent className="p-4 space-y-3 py-0">
                      <div className="space-y-2">
                        <Label
                          htmlFor={`interval-${cycleIndex}-${intervalIndex}-name`}
                          className="text-xs"
                        >
                          Nom
                        </Label>
                        <Input
                          id={`interval-${cycleIndex}-${intervalIndex}-name`}
                          value={interval.name}
                          onChange={(e) =>
                            updateInterval(cycleIndex, intervalIndex, {
                              name: e.target.value,
                            })
                          }
                          placeholder="Ex: Travail, Repos..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 space-y-2">
                          <Label
                            htmlFor={`interval-${cycleIndex}-${intervalIndex}-duration`}
                            className="text-xs"
                          >
                            Durée (s)
                          </Label>
                          <Input
                            id={`interval-${cycleIndex}-${intervalIndex}-duration`}
                            type="number"
                            min="1"
                            value={interval.duration}
                            onChange={(e) =>
                              updateInterval(cycleIndex, intervalIndex, {
                                duration: parseInt(e.target.value) || 1,
                              })
                            }
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label
                            htmlFor={`interval-${cycleIndex}-${intervalIndex}-color`}
                            className="text-xs"
                          >
                            Couleur
                          </Label>
                          <Input
                            id={`interval-${cycleIndex}-${intervalIndex}-color`}
                            className="p-0 border-none"
                            type="color"
                            value={interval.color || INTERVAL_COLORS.default}
                            onChange={(e) =>
                              updateInterval(cycleIndex, intervalIndex, {
                                color: e.target.value,
                              })
                            }
                          />
                        </div>
                        {cycle.intervals.length > 1 && (
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() =>
                                removeInterval(cycleIndex, intervalIndex)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
              </div>
            </CardContent>
          </Card>
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
