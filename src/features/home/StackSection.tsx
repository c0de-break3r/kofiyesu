import { profile } from "@/data/profile";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TechScroll } from "@/components/ui/TechScroll";

/** Technology overview for the one-pager — horizontally scrollable real icons. */
export function StackSection() {
  return (
    <section id="stack" className="w-full px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeader
            title="Tools I use"
            intro="The technologies behind every product I ship — from interface to data layer. Hover any tool to see what it does."
          />
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-8">
            <TechScroll technologies={profile.technologies} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
