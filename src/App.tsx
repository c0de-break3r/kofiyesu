import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { lazyPage } from "@/lib/lazyWithRetry";
import { syncRouteDocumentClass } from "@/lib/threeRoute";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/hooks/useTheme";
import { getLenis, useScroll } from "@/hooks/useScroll";
import { useHashScroll } from "@/hooks/useHashScroll";
import { syncPath } from "@/lib/routeState";
import { SkipToContent } from "@/components/layout/SkipToContent";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import { SeoManager } from "@/components/seo/SeoManager";
import { SiteContentProvider } from "@/hooks/useSiteContent";
import { HomePage } from "@/pages/HomePage";
const ProjectPage = lazy(() => lazyPage(() => import("@/pages/ProjectPage"), "ProjectPage"));

function AppRoutes() {
  const location = useLocation();
  useHashScroll(location.pathname === "/");

  useEffect(() => {
    syncPath(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const { onHome } = syncRouteDocumentClass(location.pathname);
    const lenis = getLenis();

    if (!onHome) {
      lenis?.start();
      lenis?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    } else {
      lenis?.start();
      lenis?.scrollTo(0, { immediate: true });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  }, [location.pathname]);

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/project/:slug" element={<ProjectPage />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  useTheme();
  useScroll();

  return (
    <SiteContentProvider>
      <SeoManager />
      <SkipToContent />
      <Header />
      <AppRoutes />
      <PwaInstallPrompt />
      <MobileNav />
    </SiteContentProvider>
  );
}
