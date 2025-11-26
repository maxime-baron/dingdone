"use client";

import { Session } from "@/types/timer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Copy, Pencil, Trash2 } from "lucide-react";
import { formatTimeVerbose } from "@/lib/timer-utils";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SessionCardProps {
  session: Session;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SessionCard({
  session,
  onEdit,
  onDuplicate,
  onDelete,
}: SessionCardProps) {
  return (
    <Card id={session.id} className="hover:shadow-lg transition-shadow gap-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{session.name}</span>
          <Badge variant="secondary">
            {formatTimeVerbose(session.totalDuration)}
          </Badge>
        </CardTitle>
        <CardDescription>
          {session.cycles.length} cycle{session.cycles.length > 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {session.cycles.map((cycle, idx) => (
          <Card
            key={cycle.id}
            className={cn("bg-muted/50 py-1", { "mt-2": idx > 0 })}
          >
            <CardContent className="p-3 py-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Cycle {idx + 1}</span>
                <Badge variant="outline" className="text-xs">
                  {cycle.repetitions}x
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {cycle.intervals.map((interval) => (
                  <Badge
                    key={interval.id}
                    className="text-xs"
                    style={{
                      backgroundColor: interval.color || "#6b7280",
                    }}
                  >
                    {interval.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild className="flex-1">
          <Link href={`/timer/${session.id}`}>
            <Play className="mr-2 h-4 w-4" />
            Démarrer
          </Link>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onEdit(session.id)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDuplicate(session.id)}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onDelete(session.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
