import { LayoutGrid, Settings, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";
import { useProjects } from "@/features/projects/hooks/useProjects";

interface SidebarProps {
  /** Controls the mobile off-canvas state. Ignored above the md breakpoint, where the sidebar is always visible. */
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [{ to: "/", icon: LayoutGrid, label: "Dashboard", end: true }];

/** Enough for a useful quick-jump list — the full set lives on the Dashboard grid. */
const SIDEBAR_PROJECT_LIMIT = 8;

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const projectsQuery = useProjects({ limit: SIDEBAR_PROJECT_LIMIT });
  const projects = projectsQuery.data?.items ?? [];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "glass-surface fixed inset-y-0 left-0 z-40 flex w-64 flex-col p-4 transition-transform duration-200 md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2">
            <div className="from-accent to-accent-glow h-7 w-7 rounded-lg bg-gradient-to-br" />
            <span className="font-display text-text-primary text-lg font-semibold">SyncRoot</span>
          </div>
          <button
            onClick={onMobileClose}
            aria-label="Close menu"
            className="text-text-tertiary rounded-md p-1 hover:bg-white/5 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onMobileClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-accent-muted text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5",
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 flex-1 overflow-y-auto">
          <p className="text-text-tertiary px-3 text-xs font-medium tracking-wide uppercase">
            Projects
          </p>

          {projectsQuery.isLoading && (
            <div className="mt-2 flex flex-col gap-1.5 px-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-bg-elevated h-6 animate-pulse rounded-md" />
              ))}
            </div>
          )}

          {projectsQuery.isError && (
            <p className="text-text-tertiary mt-2 px-3 text-xs">Couldn't load projects.</p>
          )}

          {projectsQuery.isSuccess && projects.length === 0 && (
            <p className="text-text-tertiary mt-2 px-3 text-xs">
              No projects yet — create one from the Dashboard.
            </p>
          )}

          {projects.length > 0 && (
            <nav className="mt-1 flex flex-col gap-0.5">
              {projects.map((project) => (
                <NavLink
                  key={project.id}
                  to={`/projects/${project.id}`}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-[var(--radius-control)] px-3 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-accent-muted text-text-primary"
                        : "text-text-secondary hover:text-text-primary hover:bg-white/5",
                    )
                  }
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="truncate">{project.name}</span>
                </NavLink>
              ))}
            </nav>
          )}
        </div>

        <NavLink
          to="/settings"
          onClick={onMobileClose}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-accent-muted text-text-primary"
                : "text-text-secondary hover:text-text-primary hover:bg-white/5",
            )
          }
        >
          <Settings className="h-4 w-4" />
          Settings
        </NavLink>
      </aside>
    </>
  );
}
