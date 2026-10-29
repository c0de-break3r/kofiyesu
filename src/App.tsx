import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { lazyPage } from "@/lib/lazyWithRetry";
import { useTheme } from "@/hooks/useTheme";
import { SkipToContent } from "@/components/layout/SkipToContent";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import { ScrollTopButton } from "@/components/ui/ScrollTopButton";
import { SeoManager } from "@/components/seo/SeoManager";
import { HomePage } from "@/pages/HomePage";

const ProjectsPage = lazy(() => lazyPage(() => import("@/pages/ProjectsPage"), "default"));
const ExperiencePage = lazy(() =>
  lazyPage(() => import("@/pages/ExperiencePage"), "default"),
);
const AboutPage = lazy(() => lazyPage(() => import("@/pages/AboutPage"), "default"));
const ProjectPage = lazy(() => lazyPage(() => import("@/pages/ProjectPage"), "ProjectPage"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  useTheme();

  return (
    <>
      <SeoManager />
      <SkipToContent />
      <ScrollToTop />
      <Header />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/project/:slug" element={<ProjectPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
      <PwaInstallPrompt />
      <ScrollTopButton />
      <MobileNav />
    </>
  );
}
