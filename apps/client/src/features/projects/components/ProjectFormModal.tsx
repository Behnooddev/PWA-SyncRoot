import { type FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { ProjectDto } from "@syncroot/shared-types";

const COLOR_SWATCHES = ["#6E5AF0", "#F87171", "#FBBF24", "#34D399", "#38BDF8", "#F472B6"];
const DEFAULT_COLOR = COLOR_SWATCHES[0] ?? "#6E5AF0";

interface ProjectFormValues {
  name: string;
  description: string;
  color: string;
}

interface ProjectFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ProjectFormValues) => void;
  isSubmitting: boolean;
  /** Present for edit mode, absent for create. */
  project?: ProjectDto;
}

export function ProjectFormModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  project,
}: ProjectFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [nameError, setNameError] = useState<string | null>(null);

  // Reset (or prefill for edit) whenever the modal is opened.
  useEffect(() => {
    if (open) {
      setName(project?.name ?? "");
      setDescription(project?.description ?? "");
      setColor(project?.color ?? DEFAULT_COLOR);
      setNameError(null);
    }
  }, [open, project]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Project name is required.");
      return;
    }
    onSubmit({ name: trimmed, description: description.trim(), color });
  }

  return (
    <Modal open={open} onClose={onClose} title={project ? "Edit project" : "New project"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError(null);
          }}
          error={nameError ?? undefined}
          maxLength={120}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-text-secondary text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="What's this project about? (optional)"
            className="border-border-strong bg-bg-elevated text-text-primary placeholder:text-text-tertiary focus:border-accent resize-none rounded-[var(--radius-control)] border px-3 py-2 text-sm transition-colors outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-text-secondary text-sm font-medium">Color</label>
          <div className="flex gap-2">
            {COLOR_SWATCHES.map((swatch) => (
              <button
                key={swatch}
                type="button"
                onClick={() => setColor(swatch)}
                aria-label={`Select color ${swatch}`}
                className={cn(
                  "h-7 w-7 rounded-full transition-transform hover:scale-110",
                  color === swatch && "ring-offset-bg-elevated ring-2 ring-white/80 ring-offset-2",
                )}
                style={{ backgroundColor: swatch }}
              />
            ))}
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : project ? "Save changes" : "Create project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
