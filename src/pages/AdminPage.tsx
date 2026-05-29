import { Navigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { useAuth } from "@clerk/clerk-react";
import { isClerkConfigured } from "@/lib/clerk";
import { isClerkAdminUser } from "@/lib/clerkAdmin";
import { AdminInquiriesSection } from "@/components/admin/AdminInquiriesSection";
import { AdminProjectsSection } from "@/components/admin/AdminProjectsSection";
import { AdminAboutSection } from "@/components/admin/AdminAboutSection";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

type Tab = "inquiries" | "projects" | "about";

const tabs: { id: Tab; label: string }[] = [
  { id: "inquiries", label: "Inquiries" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
];

function AdminContent() {
  const { userId } = useAuth();
  const [tab, setTab] = useState<Tab>("inquiries");

  if (!isClerkAdminUser(userId)) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <p className="text-lg font-bold">Admin access required</p>
        <p className="text-sm text-[var(--text-muted)]">Your account is not authorized for this area.</p>
        <Link to="/">
          <Button variant="border">Back to home</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-24 pt-28 md:pt-32">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/" className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--color-accent)]">
            ← Back to site
          </Link>
          <h1 className="mt-2 text-2xl font-black">Admin CMS</h1>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              tab === id
                ? "bg-[var(--color-accent)] text-white"
                : "border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--color-accent)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 md:p-6">
        {tab === "inquiries" && <AdminInquiriesSection />}
        {tab === "projects" && <AdminProjectsSection />}
        {tab === "about" && <AdminAboutSection />}
      </div>
    </main>
  );
}

export function AdminPage() {
  if (!isClerkConfigured) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <SignedOut>
        <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-24 text-center">
          <p className="text-sm text-[var(--text-muted)]">Sign in with an admin account to continue.</p>
          <SignInButton mode="modal">
            <Button>Sign in</Button>
          </SignInButton>
        </main>
      </SignedOut>
      <SignedIn>
        <AdminContent />
      </SignedIn>
    </>
  );
}
