import { profile } from "@/data/profile";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

/** Closing contact section for the one-pager. Links live in the footer. */
export function ConnectSection() {
  return (
    <section id="connect" className="w-full px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeader
            title="Get in touch"
            intro="Open to full-stack engineering, AI-powered applications, SaaS, automation, and security-focused work — let's build something solid."
          />
        </Reveal>

        <Reveal delay={0.05}>
          <div className="max-w-2xl">
            <p className="text-base leading-relaxed text-[var(--text-muted)]">
              {profile.connect.blurb}
            </p>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">
              Always open to discussing
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {profile.connect.openTo.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-semibold text-[var(--text)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
