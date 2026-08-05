import { type FormEvent, type ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface NameGateProps {
  children: ReactNode;
}

/**
 * Per the brief: "When the application opens for the first time, ask the
 * user: 'What is your name?'" — this is that prompt. Renders instead of
 * `children` until a name is stored; every comment/task/todo/activity
 * downstream displays that name as the author (see currentUser.id in the
 * server's resolveCurrentUser middleware, which the axios interceptor
 * feeds from this exact stored value).
 */
export function NameGate({ children }: NameGateProps) {
  const { name, setUserName } = useCurrentUser();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (name) return <>{children}</>;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      setError("Please enter a name.");
      return;
    }
    if (trimmed.length > 50) {
      setError("Name must be 50 characters or fewer.");
      return;
    }
    setUserName(trimmed);
  }

  return (
    <div className="bg-bg-base flex min-h-screen items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <GlassCard>
          <h1 className="font-display text-text-primary text-2xl font-semibold">
            Welcome to SyncRoot
          </h1>
          <p className="text-text-secondary mt-1 text-sm">What should we call you?</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Input
              autoFocus
              placeholder="Your name"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (error) setError(null);
              }}
              error={error ?? undefined}
            />
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>

          <p className="text-text-tertiary mt-4 text-xs">
            No account needed — this name is stored on your device and shown next to your comments,
            tasks, and activity.
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
