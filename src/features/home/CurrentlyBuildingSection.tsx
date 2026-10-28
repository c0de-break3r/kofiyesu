import { profile } from "@/data/profile";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

/** Products in active development — honest "in development" label on each. */
export function CurrentlyBuildingSection() {
  return (
    <section id="building" className="w-full px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeader
            index="03"
            title="Currently building"
            intro="Products in active development — exploring these ideas beyond demos."
          />
        </Reveal>

        <Reveal delay={0.08}>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
            {profile.currentlyBuilding.map((item) => (
              <div key={item.name} className="bg-[var(--surface)] p-6 md:p-8">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold tracking-tight text-[var(--text)]">
                    {item.name}
                  </h3>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--color-accent)]">
                    In development
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                  {item.description}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {item.focus.map((tag) => (
                    <li
                      key={tag}
                      className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[var(--text-muted)]"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
