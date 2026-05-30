import { useEffect } from "react";
import {
  SITE_TITLE,
  SITE_DESCRIPTION,
  OG_IMAGE_URL,
  absoluteUrl,
} from "@/lib/siteMeta";

type MetaInput = {
  enabled?: boolean;
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogType?: string;
  noIndex?: boolean;
};

function upsertMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

export function useDocumentMeta({
  enabled = true,
  title,
  description,
  canonicalPath = "/",
  ogType = "website",
  noIndex = false,
}: MetaInput) {
  useEffect(() => {
    if (!enabled) return;
    const pageTitle = title ?? SITE_TITLE;
    const pageDescription = description ?? SITE_DESCRIPTION;
    const canonical = absoluteUrl(canonicalPath);

    document.title = pageTitle;
    upsertMeta("description", pageDescription);
    upsertMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");
    upsertMeta("og:title", pageTitle, "property");
    upsertMeta("og:description", pageDescription, "property");
    upsertMeta("og:type", ogType, "property");
    upsertMeta("og:url", canonical, "property");
    upsertMeta("og:image", OG_IMAGE_URL, "property");
    upsertMeta("twitter:title", pageTitle);
    upsertMeta("twitter:description", pageDescription);
    upsertMeta("twitter:image", OG_IMAGE_URL);
    upsertCanonical(canonical);
  }, [enabled, title, description, canonicalPath, ogType, noIndex]);
}
