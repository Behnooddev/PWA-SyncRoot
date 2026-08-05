import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isConfirming?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  isConfirming = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-text-secondary text-sm">{description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isConfirming}>
          {isConfirming ? "Deleting…" : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
