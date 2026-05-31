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
