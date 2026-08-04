import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { api } from "@/lib/axios";

interface HealthResponse {
  status: string;
  timestamp: string;
}

async function fetchHealth(): Promise<HealthResponse> {
  const res = await api.get<HealthResponse>("/health");
  return res.data;
}

/**
 * Temporary Phase 1 landing route. Its only job is to prove the full
 * stack is wired correctly end to end:
 *   - Vite + Tailwind v4 tokens + custom fonts render
 *   - Axios client reaches the Express server
 *   - React Query fetches and caches real data
 * Replaced by the actual dashboard in Phase 5.
 */
export function StackCheckPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
  });

  return (
    <main className="bg-bg-base flex min-h-screen items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <GlassCard>
          <h1 className="font-display text-text-primary text-2xl font-semibold">SyncRoot</h1>
          <p className="text-text-secondary mt-1 text-sm">A Modern Collaborative Workspace</p>

          <div className="border-border-subtle bg-bg-surface mt-6 flex items-center gap-3 rounded-[var(--radius-control)] border p-4">
            {isLoading && (
              <>
                <Loader2 className="text-accent h-5 w-5 animate-spin" />
                <span className="text-text-secondary text-sm">Checking server connection…</span>
              </>
            )}

            {isError && (
              <>
                <XCircle className="text-danger h-5 w-5" />
                <div className="text-sm">
                  <p className="text-danger">Server unreachable</p>
                  <p className="text-text-tertiary">
                    {error instanceof Error ? error.message : "Unknown error"} — is{" "}
                    <code className="font-mono text-xs">npm run dev:server</code> running?
                  </p>
                </div>
              </>
            )}

            {data && (
              <>
                <CheckCircle2 className="text-success h-5 w-5" />
                <div className="text-sm">
                  <p className="text-text-primary">Server connected</p>
                  <p className="text-text-tertiary font-mono text-xs">{data.timestamp}</p>
                </div>
              </>
            )}
          </div>

          <p className="text-text-tertiary mt-6 text-xs">
            Phase 1 scaffold — dashboard and project workspace land in later phases.
          </p>
        </GlassCard>
      </motion.div>
    </main>
  );
}
