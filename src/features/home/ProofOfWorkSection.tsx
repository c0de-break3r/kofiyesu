import { Reveal } from "@/components/ui/Reveal";
import { ProjectShowcase, type ShowcaseItem } from "@/components/ui/ProjectShowcase";
import { getAllProjects } from "@/lib/projects";
import { STATUS_LABELS } from "@/data/types";
import { profile } from "@/data/profile";

function toId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Projects kept out of the home showcase (still available on /projects). */
const EXCLUDED_SLUGS = new Set(["driver-connect", "api-pentest-workflows"]);

/**
 * The one-pager showcase — real projects and in-development products combined
 * into one Apple-style swipeable carousel. No section header.
 */
export function ProofOfWorkSection() {
  const projectItems: ShowcaseItem[] = getAllProjects()
    .filter((p) => !EXCLUDED_SLUGS.has(p.slug))
    .map((p) => ({
    id: p.slug,
    kicker: STATUS_LABELS[p.status],
    headline: p.title,
    body: p.summary,
    image: p.thumbnail,
    href: `/project/${p.slug}`,
    }));

  const buildingItems: ShowcaseItem[] = profile.currentlyBuilding.map((b) => ({
    id: toId(b.name),
    kicker: "In development",
    headline: b.name,
    body: b.description,
  }));

  const items = [...projectItems, ...buildingItems];

  return (
    <section id="work" className="w-full px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <ProjectShowcase items={items} />
        </Reveal>
      </div>
    </section>
  );
}
