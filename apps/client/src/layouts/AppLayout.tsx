import { useState } from "react";
import { Outlet, useLocation, useMatches } from "react-router-dom";
import { motion } from "framer-motion";
import { Sidebar } from "@/layouts/Sidebar";
import { Navbar } from "@/layouts/Navbar";

interface RouteHandle {
  title?: string;
}

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const matches = useMatches();
  const location = useLocation();

  // The deepest matched route's `handle.title` wins — see router/index.tsx
  // where each page route sets `handle: { title: "..." }`.
  const title = [...matches].reverse().find((m) => (m.handle as RouteHandle | undefined)?.title)
    ?.handle as RouteHandle | undefined;

  return (
    <div className="bg-bg-base flex h-screen overflow-hidden">
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar title={title?.title ?? "SyncRoot"} onMenuClick={() => setMobileMenuOpen(true)} />

        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="flex-1 overflow-y-auto p-4 md:p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
