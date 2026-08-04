import { QueryClient } from "@tanstack/react-query";

/**
 * Since V1 has no WebSocket sync (decided in Phase 0 planning), React
 * Query's background refetch is how other users' changes eventually show
 * up without a manual refresh. refetchInterval is deliberately NOT set
 * globally here — it's too aggressive for detail views and wasteful for
 * rarely-changing data. Instead, each feature's query hook opts into
 * polling explicitly (e.g. the activity feed refetches every 15s, a
 * single task's comments refetch every 20s), so the choice is visible at
 * the call site instead of hidden in global config.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});
