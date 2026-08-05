import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ProjectWorkspacePage } from "@/features/project-workspace/ProjectWorkspacePage";
import { SettingsPage } from "@/features/settings/SettingsPage";

/**
 * Real route tree (Phase 4). Dashboard and Project Workspace are
 * intentionally stub content until Phases 5 and 6 build them out — the
 * point of this phase is the layout/routing/navigation shell working
 * correctly, not the feature content inside it.
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
