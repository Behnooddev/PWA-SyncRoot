import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ProjectWorkspacePage } from "@/features/project-workspace/ProjectWorkspacePage";
import { SettingsPage } from "@/features/settings/SettingsPage";

/**
 * Real route tree (shell built in Phase 4). Dashboard (Phase 5) and
 * Project Workspace (Phase 6) are both real now; Phases 7-11 fill in the
 * Workspace's tab content (see WorkspaceTabPlaceholder usages in
 * ProjectWorkspacePage.tsx for exactly which phase builds which tab).
 *
 * `handle.title` on each route feeds AppLayout's Navbar title — see
 * layouts/AppLayout.tsx.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage />, handle: { title: "Dashboard" } },
      { path: "projects/:id", element: <ProjectWorkspacePage />, handle: { title: "Project" } },
      { path: "settings", element: <SettingsPage />, handle: { title: "Settings" } },
    ],
  },
]);
