import { useLocation } from "react-router-dom";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { SITE_TITLE } from "@/lib/siteMeta";

/** Keeps document title and social meta in sync with the active route. */
export function SeoManager() {
  const { pathname } = useLocation();
  const isProject = pathname.startsWith("/project/");
  const isChat = pathname.startsWith("/chat");

  useDocumentMeta({
    enabled: !isProject,
    canonicalPath: pathname || "/",
    title: isChat ? `Chat — ${SITE_TITLE}` : SITE_TITLE,
    description: isChat
      ? "Start a project or ask about full-stack development, mobile apps, and application security with Obed Prince Kofi Yesu."
      : undefined,
  });

  return null;
}
