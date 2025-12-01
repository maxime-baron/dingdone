import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Cycle } from "@/types/timer";
import { ReactNode } from "react";

export default function CycleCard({
  cycle,
  index,
  cycleCount,
  onDelete,
  onUpdateRepetition,
  children,
}: {
  cycle: Cycle;
  index: number;
  cycleCount: number;
  onDelete: () => void;
  onUpdateRepetition: (repetitions: number) => void;
  children: ReactNode;
}) {
  return (
    <Card key={cycle.id} className=" gap-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Cycle {index + 1}</CardTitle>
          {cycleCount > 1 && (
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`cycle-${index}-repetitions`}>
            Nombre de répétitions
          </Label>
          <Input
            id={`cycle-${index}-repetitions`}
            type="number"
            value={cycle.repetitions}
            onChange={(e) => onUpdateRepetition(parseInt(e.target.value))}
          />
        </div>
        <div className="space-y-3">
          <Label>Intervalles</Label>
          {children}
          {/* {cycle.intervals.map((interval, intervalIndex) => (
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
          ))} */}
          {/* <Button
            type="button"
            variant="outline"
            onClick={() => addInterval(cycleIndex)}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un intervalle
          </Button> */}
        </div>
      </CardContent>
    </Card>
  );
}
