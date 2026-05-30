import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { AdminStatusMessage } from "./AdminStatusMessage";

type AdminActionBarProps = {
  error?: string | null;
  success?: string | null;
  info?: string | null;
  saving?: boolean;
  onSave: () => void;
  saveLabel?: string;
  onDelete?: () => void;
  deleteLabel?: string;
  deleteDisabled?: boolean;
  onCancel?: () => void;
  cancelLabel?: string;
  extra?: ReactNode;
};

export function AdminActionBar({
  error,
  success,
  info,
  saving = false,
  onSave,
  saveLabel = "Save",
  onDelete,
  deleteLabel = "Delete",
  deleteDisabled = false,
  onCancel,
  cancelLabel = "Cancel",
  extra,
}: AdminActionBarProps) {
  return (
    <div className="shrink-0 border-t border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 md:px-5">
      <div className="space-y-2">
        {error ? <AdminStatusMessage type="error" message={error} /> : null}
        {success ? <AdminStatusMessage type="success" message={success} /> : null}
        {info ? <AdminStatusMessage type="info" message={info} /> : null}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button className="min-w-[5.5rem]" onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : saveLabel}
        </Button>
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={saving || deleteDisabled}
            className="rounded-full border border-red-500/40 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-500/10 disabled:opacity-50"
          >
            {deleteLabel}
          </button>
        ) : null}
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--color-accent)] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        ) : null}
        {extra}
      </div>
    </div>
  );
}
