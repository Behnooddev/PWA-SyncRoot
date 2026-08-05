import { type FormEvent, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/**
 * Only the name field is real for now — Appearance/Storage/Preferences
 * (per the original brief's Phase 13 scope) land later. Shipping a
 * working name-change here rather than a fully placeholder page, since
 * it's the one setting that already has a working backing store
 * (lib/username.ts) from Phase 1.
 */
export function SettingsPage() {
  const { name, setUserName } = useCurrentUser();
  const [draft, setDraft] = useState(name ?? "");
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    setUserName(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-md">
      <GlassCard>
        <h2 className="font-display text-text-primary text-lg font-semibold">Your name</h2>
        <p className="text-text-secondary mt-1 text-sm">
          Shown next to your comments, tasks, and activity across every project.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={50} />
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!draft.trim() || draft.trim() === name}>
              Save
            </Button>
            {saved && <span className="text-success text-sm">Saved</span>}
          </div>
        </form>
      </GlassCard>

      <p className="text-text-tertiary mt-4 text-xs">
        Appearance, storage, and other preferences are coming in a later phase.
      </p>
    </div>
  );
}
