import type { ProjectComponent } from "@/types/projects";

const MANAGED_BODY_TITLE = "What I built";

export function extractProjectFormFromComponents(components: ProjectComponent[] = []) {
  const videoBlock = components.find(
    (c) => c.type === "media" && c.props.type === "video",
  );
  const textBlock = components.find(
    (c) => c.type === "text" && c.props.title === MANAGED_BODY_TITLE,
  );

  return {
    showcase_video_url: videoBlock?.type === "media" ? videoBlock.props.src : "",
    showcase_video_caption:
      videoBlock?.type === "media" ? videoBlock.props.caption ?? "" : "",
    body_text: textBlock?.type === "text" ? textBlock.props.text : "",
  };
}

export function buildProjectComponents(input: {
  showcase_video_url?: string;
  showcase_video_caption?: string;
  body_text?: string;
}): ProjectComponent[] {
  const components: ProjectComponent[] = [];

  if (input.showcase_video_url?.trim()) {
    components.push({
      type: "media",
      props: {
        type: "video",
        src: input.showcase_video_url.trim(),
        caption: input.showcase_video_caption?.trim() || undefined,
      },
    });
  }

  if (input.body_text?.trim()) {
    components.push({
      type: "text",
      props: {
        title: MANAGED_BODY_TITLE,
        text: input.body_text.trim(),
      },
    });
  }

  return components;
}

/** Update CMS-managed showcase + body blocks without dropping other project content. */
export function mergeProjectComponents(
  existing: ProjectComponent[] = [],
  input: {
    showcase_video_url?: string;
    showcase_video_caption?: string;
    body_text?: string;
  },
): ProjectComponent[] {
  const managed = buildProjectComponents(input);
  const rest = existing.filter((c) => {
    if (c.type === "media" && c.props.type === "video") return false;
    if (c.type === "text" && c.props.title === MANAGED_BODY_TITLE) return false;
    return true;
  });
  return [...managed, ...rest];
}

/** Align the first detail-page image with the grid thumbnail. */
export function syncThumbnailInComponents(
  components: ProjectComponent[] = [],
  thumbnailUrl: string | null | undefined,
): ProjectComponent[] {
  const thumb = thumbnailUrl?.trim();
  if (!thumb) return components;

  const next = [...components];
  const firstImageIdx = next.findIndex(
    (c) =>
      (c.type === "media" && c.props.type === "image") || c.type === "imageText",
  );

  if (firstImageIdx >= 0) {
    const block = next[firstImageIdx];
    if (block.type === "media" && block.props.type === "image" && block.props.src !== thumb) {
      next[firstImageIdx] = { ...block, props: { ...block.props, src: thumb } };
    } else if (block.type === "imageText" && block.props.image !== thumb) {
      next[firstImageIdx] = { ...block, props: { ...block.props, image: thumb } };
    }
    return next;
  }

  const insertAt =
    next[0]?.type === "media" && next[0].props.type === "video" ? 1 : 0;
  next.splice(insertAt, 0, {
    type: "media",
    props: { type: "image", src: thumb, alt: "" },
  });
  return next;
}

/** Bust CDN/browser cache when CMS media is replaced at the same path. */
export function cacheBustMediaUrl(url: string, version?: string | null): string {
  if (!url || !version) return url;
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  if (!url.startsWith("http") && !url.startsWith("/")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${encodeURIComponent(version)}`;
}

export function applyMediaCacheBust(
  components: ProjectComponent[],
  version?: string | null,
): ProjectComponent[] {
  if (!version) return components;
  return components.map((c) => {
    if (c.type === "media" && c.props.type === "image") {
      return {
        ...c,
        props: { ...c.props, src: cacheBustMediaUrl(c.props.src, version) },
      };
    }
    if (c.type === "imageText") {
      return {
        ...c,
        props: { ...c.props, image: cacheBustMediaUrl(c.props.image, version) },
      };
    }
    return c;
  });
}
