import { useQuery } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { api } from "@/lib/axios";
import { cn } from "@/lib/cn";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface NavbarProps {
  title: string;
  onMenuClick: () => void;
}

async function fetchHealth(): Promise<{ status: string }> {
  const res = await api.get<{ status: string }>("/health");
  return res.data;
}

export function Navbar({ title, onMenuClick }: NavbarProps) {
  const { name } = useCurrentUser();

  // Lightweight polling status check rather than a one-off Phase 1 page —
  // consistent with the "no WebSocket, poll instead" decision from
  // PHASE_0_PLANNING.md, applied here to connection health specifically.
  const { isSuccess, isError } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
    retry: 1,
  });

  return (
    <header className="glass-surface flex h-14 shrink-0 items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="text-text-secondary rounded-md p-1.5 hover:bg-white/5 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-display text-text-primary text-base font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <span
          className="text-text-tertiary flex items-center gap-1.5 text-xs"
          title={
            isSuccess
              ? "Connected to server"
              : isError
                ? "Server unreachable"
                : "Checking connection…"
          }
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isSuccess && "bg-success",
              isError && "bg-danger",
              !isSuccess && !isError && "bg-text-tertiary animate-pulse",
            )}
          />
          {isSuccess ? "Connected" : isError ? "Offline" : "Checking…"}
        </span>

        {name && (
          <div className="bg-bg-elevated flex items-center gap-2 rounded-full py-1 pr-3 pl-1">
            <div className="bg-accent flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-white">
              {name.charAt(0).toUpperCase()}
            </div>
            <span className="text-text-secondary text-sm">{name}</span>
          </div>
        )}
      </div>
    </header>
  );
}
