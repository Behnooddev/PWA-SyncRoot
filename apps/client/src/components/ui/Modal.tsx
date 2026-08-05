import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Set false for flows that must be completed before dismissing (e.g. the first-launch name prompt). */
  dismissible?: boolean;
}

export function Modal({ open, onClose, title, children, dismissible = true }: ModalProps) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={dismissible ? onClose : undefined}
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md"
          >
            <GlassCard className="bg-bg-elevated/95">
              {(title || dismissible) && (
                <div className="mb-4 flex items-center justify-between">
                  {title && (
                    <h2 className="font-display text-text-primary text-lg font-semibold">
                      {title}
                    </h2>
                  )}
                  {dismissible && (
                    <button
                      onClick={onClose}
                      aria-label="Close"
                      className="text-text-tertiary hover:text-text-primary rounded-md p-1 transition-colors hover:bg-white/5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
              {children}
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
