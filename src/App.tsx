import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/hooks/useTheme";
import { getLenis, useScroll } from "@/hooks/useScroll";
import { useHashScroll } from "@/hooks/useHashScroll";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { syncPath } from "@/lib/routeState";
import { resetHomeScene } from "@/animations/resetHomeScene";
import { SkipToContent } from "@/components/layout/SkipToContent";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import { AdminFab, AdminSignInOpenPanel } from "@/components/auth/AdminAccess";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { SeoManager } from "@/components/seo/SeoManager";
import { HomePage } from "@/pages/HomePage";
import { ChatPage } from "@/pages/ChatPage";
import { ProjectPage } from "@/pages/ProjectPage";

function AppRoutes() {
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  useHashScroll(location.pathname === "/");

  useEffect(() => {
    syncPath(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const onChat = location.pathname.startsWith("/chat");
    const onProject = location.pathname.startsWith("/project/");
    void import("@/three/core/renderer").then(({ renderer }) => {
      renderer.setIsActive(!onChat && !onProject && !reducedMotion);
      if (!onChat && !onProject) {
        resetHomeScene();
        getLenis()?.scrollTo(0, { immediate: true });
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }
    });
  }, [location.pathname, reducedMotion]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chat/*" element={<ChatPage />} />
      <Route path="/project/:slug" element={<ProjectPage />} />
    </Routes>
  );
}

export default function App() {
  useTheme();
  useScroll();

  return (
    <>
      <AdminSignInOpenPanel />
      <SeoManager />
      <SkipToContent />
      <Header />
      <AppRoutes />
      <PwaInstallPrompt />
      <AdminPanel />
      <AdminFab />
      <MobileNav />
    </>
  );
}
