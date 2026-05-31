import { useEffect, useState } from "react";
import { useAdminPanel } from "@/hooks/useAdminPanel";
import { getLenis } from "@/hooks/useScroll";
import { AdminInquiriesSection } from "./AdminInquiriesSection";
import { AdminProjectsSection } from "./AdminProjectsSection";
import { AdminFeaturesSection } from "./AdminFeaturesSection";
import { AdminAboutSection } from "./AdminAboutSection";

type Tab = "inquiries" | "features" | "projects" | "about";

const tabs: { id: Tab; label: string }[] = [
  { id: "inquiries", label: "Inquiries" },
  { id: "features", label: "Features" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
];

export function AdminPanel() {
  const { open, close } = useAdminPanel();
  const [tab, setTab] = useState<Tab>("inquiries");

  useEffect(() => {
    if (!open) return;

    const lenis = getLenis();
    lenis?.stop();

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      lenis?.start();
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm touch-none"
        aria-label="Close admin panel"
        onClick={close}
      />
      <aside
        className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-lg flex-col border-l border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl md:max-w-xl lg:max-w-2xl"
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-label="Admin CMS"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-4 py-3 md:px-5">
          <h2 className="text-lg font-black">Admin CMS</h2>
          <button
            type="button"
            onClick={close}
            className="rounded-lg px-3 py-1.5 text-sm font-bold transition hover:bg-[var(--border)]"
          >
            Close
          </button>
        </div>

        <div className="flex shrink-0 gap-1 border-b border-[var(--border)] px-3 py-2 md:px-4">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition md:text-sm ${
                tab === id
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-[var(--text-muted)] hover:bg-[var(--border)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {tab === "inquiries" && (
            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 md:p-5"
              data-lenis-prevent
            >
              <AdminInquiriesSection />
            </div>
          )}
          {tab === "projects" && <AdminProjectsSection />}
          {tab === "features" && <AdminFeaturesSection />}
          {tab === "about" && <AdminAboutSection />}
        </div>
      </aside>
    </>
  );
}
