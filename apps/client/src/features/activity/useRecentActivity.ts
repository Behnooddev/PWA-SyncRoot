import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ApiSuccess, RecentActivityDto } from "@syncroot/shared-types";

async function fetchRecentActivity(limit: number): Promise<RecentActivityDto[]> {
  const res = await api.get<ApiSuccess<RecentActivityDto[]>>("/activity/recent", {
    params: { limit },
  });
  return res.data.data;
}

export function useRecentActivity(limit = 8) {
  return useQuery({
    queryKey: ["activity", "recent", limit],
    queryFn: () => fetchRecentActivity(limit),
    refetchInterval: 15_000,
  });
}
