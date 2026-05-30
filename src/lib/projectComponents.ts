import type { ProjectComponent } from "@/types/projects";

export function extractProjectFormFromComponents(components: ProjectComponent[] = []) {
  const videoBlock = components.find(
    (c) => c.type === "media" && c.props.type === "video",
  );
  const textBlock = components.find((c) => c.type === "text");

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
        title: "What I built",
        text: input.body_text.trim(),
      },
    });
  }

  return components;
}
