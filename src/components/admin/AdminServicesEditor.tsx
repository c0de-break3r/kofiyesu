import type { SiteService } from "@/types/site";

type AdminServicesEditorProps = {
  services: SiteService[];
  onChange: (services: SiteService[]) => void;
};

export function AdminServicesEditor({ services, onChange }: AdminServicesEditorProps) {
  const update = (index: number, patch: Partial<SiteService>) => {
    onChange(services.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const remove = (index: number) => {
    onChange(services.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...services, { name: "", info: "" }]);
  };

  return (
    <div className="space-y-3">
      {services.map((service, index) => (
        <div key={index} className="space-y-2 rounded-xl border border-[var(--border)] p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[var(--text-muted)]">Service {index + 1}</span>
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-xs font-bold text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
          <input
            type="text"
            value={service.name}
            onChange={(e) => update(index, { name: e.target.value })}
            placeholder="e.g. Full-Stack Web & Mobile"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
          <textarea
            value={service.info ?? ""}
            onChange={(e) => update(index, { info: e.target.value })}
            rows={2}
            placeholder="Short description shown on the about page"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full rounded-xl border border-dashed border-[var(--border)] py-2.5 text-sm font-bold text-[var(--color-accent)] transition hover:border-[var(--color-accent)]"
      >
        + Add service
      </button>
    </div>
  );
}
