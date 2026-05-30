import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { t } from "@/i18n/en";
import type { ProjectContent } from "@/types/content";
import type { TagVariant } from "@/lib/tagVariants";

interface Props {
  content: ProjectContent;
}

export function ProjectHero({ content }: Props) {
  return (
    <header className="border-b border-[var(--border)] pb-10 pt-4">
      <h1 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">{content.title}</h1>
      {content.tags?.length ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {content.tags.map((tag) => (
            <li key={tag}>
              <Tag variant={tag as TagVariant} />
            </li>
          ))}
        </ul>
      ) : null}
      {content.description ? (
        <div
          className="prose mt-6 max-w-none text-base leading-relaxed text-[var(--text-muted)] [&_a]:text-[var(--color-accent)]"
          dangerouslySetInnerHTML={{ __html: content.description }}
        />
      ) : null}
      {(content.live || content.source) && (
        <div className="mt-8 flex flex-wrap gap-3">
          {content.live ? (
            <a href={content.live} target="_blank" rel="noreferrer">
              <Button>{t("live-view")}</Button>
            </a>
          ) : null}
          {content.source ? (
            <a href={content.source} target="_blank" rel="noreferrer">
              <Button variant="border">{t("source-code")}</Button>
            </a>
          ) : null}
        </div>
      )}
    </header>
  );
}
