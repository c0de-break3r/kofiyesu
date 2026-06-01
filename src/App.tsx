import { lazy, Suspense, useEffect, useLayoutEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { lazyPage } from "@/lib/lazyWithRetry";
import { syncRouteDocumentClass, teardownHomeThreeScene } from "@/lib/threeRoute";
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
import { SiteContentProvider } from "@/hooks/useSiteContent";
import { attachAudioUnlockOnGesture } from "@/features/sounds/unlockAudio";
import { HomePage } from "@/pages/HomePage";
import { ChatPage } from "@/pages/ChatPage";
const ProjectPage = lazy(() => lazyPage(() => import("@/pages/ProjectPage"), "ProjectPage"));
const PayPage = lazy(() => lazyPage(() => import("@/pages/PayPage"), "PayPage"));

function AppRoutes() {
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  useHashScroll(location.pathname === "/");

  useEffect(() => {
    syncPath(location.pathname);
  }, [location.pathname]);

  useLayoutEffect(() => {
    const { onHome, onChat, onPay } = syncRouteDocumentClass(location.pathname);

    if (onChat || onPay) {
      teardownHomeThreeScene();
    } else if (onHome && !reducedMotion) {
      void import("@/three/core/renderer").then(({ renderer }) => {
        renderer.setIsActive(true);
      });
    } else {
      void import("@/three/core/renderer").then(({ renderer }) => {
        renderer.setIsActive(false);
      });
    }
  }, [location.pathname, reducedMotion]);

  useEffect(() => {
    const { onHome, onChat, onPay } = syncRouteDocumentClass(location.pathname);
    const lenis = getLenis();

    if (onChat || onPay) {
      lenis?.start();
      lenis?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    } else if (!onHome) {
      lenis?.start();
      lenis?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    } else {
      lenis?.start();
      resetHomeScene();
      lenis?.scrollTo(0, { immediate: true });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  }, [location.pathname]);

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat/*" element={<ChatPage />} />
        <Route path="/project/:slug" element={<ProjectPage />} />
        <Route path="/pay/:paymentId" element={<PayPage />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  useTheme();
  useScroll();

  useEffect(() => {
    attachAudioUnlockOnGesture();
  }, []);

  return (
    <SiteContentProvider>
      <AdminSignInOpenPanel />
      <SeoManager />
      <SkipToContent />
      <Header />
      <AppRoutes />
      <PwaInstallPrompt />
      <AdminPanel />
      <AdminFab />
      <MobileNav />
    </SiteContentProvider>
  );
}
