import { useLocation } from "react-router-dom";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { SITE_TITLE } from "@/lib/siteMeta";

/** Keeps document title and social meta in sync with the active route. */
export function SeoManager() {
  const { pathname } = useLocation();
  const isProject = pathname.startsWith("/project/");

  useDocumentMeta({
    enabled: !isProject,
    canonicalPath: pathname || "/",
    title: SITE_TITLE,
  });

  return null;
}
