import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Interval } from "@/types/timer";
import TimePicker from "./time-picker";
import { useState } from "react";
import { INTERVAL_COLORS } from "@/lib/timer-utils";

type PickerValue = { minute: number; second: number };

export default function IntervalCard({
  interval,
  index,
  cycleIndex,
  intervalCount,
  onDelete,
  onUpdateName,
  onUpdateTime,
  onUpdateColor,
}: {
  interval: Interval;
  index: number;
  cycleIndex: number;
  intervalCount: number;
  onDelete: () => void;
  onUpdateName: (name: string) => void;
  onUpdateTime: (duration: number) => void;
  onUpdateColor: (color: string) => void;
}) {
  const [picker, setPickerValue] = useState<PickerValue>({
    minute: Math.floor(interval.duration / 60),
    second: interval.duration % 60,
  });

  return (
    <Card key={interval.id} className="bg-muted/50">
      <CardContent className="p-4 space-y-3 py-0">
        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <Label
              htmlFor={`interval-${cycleIndex}-${index}-name`}
              className="text-xs"
            >
              Nom
            </Label>
            <Input
              id={`interval-${cycleIndex}-${index}-name`}
              value={interval.name}
              onChange={(e) => onUpdateName(e.target.value)}
              placeholder="Ex: Travail, Repos..."
            />
          </div>
          {intervalCount > 1 && (
            <div className="flex items-end">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <Label
              htmlFor={`interval-${cycleIndex}-${index}-duration`}
              className="text-xs"
            >
              Durée
            </Label>
            <TimePicker
              cycleIndex={cycleIndex}
              intervalIndex={index}
              value={picker}
              onChange={(pickerValue) => {
                setPickerValue(pickerValue);
                onUpdateTime(pickerValue.minute * 60 + pickerValue.second);
              }}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label
              htmlFor={`interval-${cycleIndex}-${index}-color`}
              className="text-xs"
            >
              Couleur
            </Label>
            <Input
              id={`interval-${cycleIndex}-${index}-color`}
              className="p-0 border-none"
              type="color"
              value={interval.color || INTERVAL_COLORS.default}
              onChange={(e) => onUpdateColor(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
