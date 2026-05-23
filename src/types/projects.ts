export type ProjectComponent =
  | {
      type: "text";
      props: { title?: string; text: string };
    }
  | {
      type: "list";
      props: { title?: string; size?: "sm" | "md" | "lg"; items: string[] };
    }
  | {
      type: "media";
      props: { type: "image" | "video"; src: string; alt?: string; caption?: string };
    }
  | {
      type: "imageText";
      props: { title?: string; text: string; image: string; imageAlt?: string };
    };
