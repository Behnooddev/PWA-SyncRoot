import { createBrowserRouter } from "react-router-dom";
import { StackCheckPage } from "@/features/stack-check/StackCheckPage";

/**
 * Phase 1 scaffolding router: a single route that proves the stack is
 * wired correctly (Tailwind tokens, fonts, API connectivity). The real
 * route tree (dashboard, project workspace, settings, etc.) is built out
 * starting Phase 4 (Frontend Foundation) and Phase 5 (Dashboard).
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <StackCheckPage />,
  },
]);
