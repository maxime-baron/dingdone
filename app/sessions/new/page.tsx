"use client";

import { SessionForm } from "@/components/session-form/session-form";
import { useSessions } from "@/hooks/use-sessions";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewSessionPage() {
  const { saveSession } = useSessions();
  const router = useRouter();

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
            <h1 className="text-2xl font-bold">Nouvelle session</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 max-w-3xl">
        <SessionForm
          onSave={(session) => {
            saveSession(session);
            router.push(`/#${session.id}`);
          }}
          onCancel={() => router.push("/")}
        />
      </main>
    </div>
  );
}
