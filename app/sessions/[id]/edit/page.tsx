"use client";

import { SessionForm } from "@/components/session-form";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSessions, saveSession } from "@/lib/storage";
import { useEffect, useState } from "react";
import { Session } from "@/types/timer";

export default function EditSessionPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const sessions = getSessions();
    const found = sessions.find((s) => s.id === params.id);
    if (found) {
      setSession(found);
    } else {
      router.push("/");
    }
  }, [params.id, router]);

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Modifier la session</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 max-w-3xl">
        <SessionForm
          initialSession={session}
          onSave={(updatedSession) => {
            saveSession(updatedSession);
            router.push("/");
          }}
          onCancel={() => router.push("/")}
        />
      </main>
    </div>
  );
}
