export const contactEmail = "hello@kofiyesu.com";

export type SocialLink = {
  url: string;
  name: "mail" | "github" | "instagram" | "linkedin" | "x";
};

export const social = [
  { url: `mailto:${contactEmail}`, name: "mail" },
  { url: "https://github.com/kofiyesu", name: "github" },
] as const satisfies SocialLink[];

/** Social links shown in the site footer (excludes mail + GitHub — those live in Get in touch). */
export const footerSocial: SocialLink[] = [];
