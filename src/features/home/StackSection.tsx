import { profile } from "@/data/profile";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TechStackCard } from "@/components/ui/TechStackCard";

/** Technology overview for the one-pager — reuses the shared TechStackCard. */
export function StackSection() {
  return (
    <section id="stack" className="w-full px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeader
            index="05"
            title="Stack I use"
            intro="Technologies I work with to build products that solve real problems — from interface to data layer."
          />
        </Reveal>

        <Reveal delay={0.08}>
          <TechStackCard label="" technologies={profile.technologies} />
        </Reveal>
      </div>
    </section>
  );
}
