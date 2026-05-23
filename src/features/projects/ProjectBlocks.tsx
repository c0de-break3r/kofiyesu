import type { ProjectComponent } from "@/types/projects";

interface Props {
  components?: ProjectComponent[];
  videoBorder?: boolean;
}

export function ProjectBlocks({ components, videoBorder }: Props) {
  if (!components?.length) return null;

  return (
    <div className="mt-14 space-y-12 md:space-y-16">
      {components.map((block, i) => {
        if (block.type === "text") {
          return (
            <section key={i} className="max-w-2xl">
              {block.props.title ? (
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{block.props.title}</h2>
              ) : null}
              <p className={`leading-relaxed text-[var(--text-muted)] ${block.props.title ? "mt-3" : ""}`}>
                {block.props.text}
              </p>
            </section>
          );
        }

        if (block.type === "list") {
          const sizeClass =
            block.props.size === "lg" ? "text-base" : block.props.size === "sm" ? "text-sm" : "text-sm md:text-base";
          return (
            <section key={i} className="max-w-2xl">
              {block.props.title ? (
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{block.props.title}</h2>
              ) : null}
              <ul className={`mt-3 list-disc space-y-2 pl-5 text-[var(--text-muted)] ${sizeClass}`}>
                {block.props.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          );
        }

        if (block.type === "imageText") {
          return (
            <section
              key={i}
              className="grid gap-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 md:grid-cols-2 md:p-6"
            >
              <img
                src={block.props.image}
                alt={block.props.imageAlt ?? ""}
                className="aspect-video w-full rounded-xl object-cover"
              />
              <div className="flex flex-col justify-center">
                {block.props.title ? <h2 className="text-xl font-bold">{block.props.title}</h2> : null}
                <p className={`text-[var(--text-muted)] ${block.props.title ? "mt-2" : ""}`}>{block.props.text}</p>
              </div>
            </section>
          );
        }

        if (block.type === "media") {
          if (block.props.type === "video") {
            return (
              <figure key={i} className="overflow-hidden">
                <video
                  src={block.props.src}
                  controls
                  playsInline
                  className={`w-full rounded-2xl ${videoBorder ? "border border-[var(--border)]" : ""}`}
                />
                {block.props.caption ? (
                  <figcaption className="mt-3 text-sm text-[var(--text-muted)]">{block.props.caption}</figcaption>
                ) : null}
              </figure>
            );
          }
          return (
            <figure key={i} className="overflow-hidden rounded-2xl">
              <img src={block.props.src} alt={block.props.alt ?? ""} className="w-full object-cover" />
              {block.props.caption ? (
                <figcaption className="mt-3 text-sm text-[var(--text-muted)]">{block.props.caption}</figcaption>
              ) : null}
            </figure>
          );
        }

        return null;
      })}
    </div>
  );
}
