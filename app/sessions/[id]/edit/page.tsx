"use client";

import { SessionForm } from "@/components/session-form";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSessions, saveSession } from "@/lib/storage";
import { use, useEffect } from "react";

export default function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const sessions = getSessions();
  const session = sessions.find((s) => s.id === id);

  useEffect(() => {
    if (!session) {
      router.push("/");
    }
  }, [session, router]);

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
