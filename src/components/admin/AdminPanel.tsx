import { useState } from "react";
import { useAdminPanel } from "@/hooks/useAdminPanel";
import { AdminInquiriesSection } from "./AdminInquiriesSection";
import { AdminProjectsSection } from "./AdminProjectsSection";
import { AdminAboutSection } from "./AdminAboutSection";

type Tab = "inquiries" | "projects" | "about";

const tabs: { id: Tab; label: string }[] = [
  { id: "inquiries", label: "Inquiries" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
];

export function AdminPanel() {
  const { open, close } = useAdminPanel();
  const [tab, setTab] = useState<Tab>("inquiries");

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
        aria-label="Close admin panel"
        onClick={close}
      />
      <aside className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-lg flex-col border-l border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h2 className="font-black">Admin CMS</h2>
          <button type="button" onClick={close} className="rounded-lg px-2 py-1 text-sm font-bold hover:bg-[var(--border)]">
            Close
          </button>
        </div>

        <div className="flex gap-1 border-b border-[var(--border)] px-2 py-2">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                tab === id
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-[var(--text-muted)] hover:bg-[var(--border)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === "inquiries" && <AdminInquiriesSection />}
          {tab === "projects" && <AdminProjectsSection />}
          {tab === "about" && <AdminAboutSection />}
        </div>
      </aside>
    </>
  );
}
