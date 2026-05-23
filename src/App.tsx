import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { HomePage } from "@/pages/HomePage";
import { ChatPage } from "@/pages/ChatPage";
import { ProjectPage } from "@/pages/ProjectPage";
import { useTheme } from "@/hooks/useTheme";
import { syncPath } from "@/lib/routeState";

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    syncPath(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const onChat = location.pathname.startsWith("/chat");
    const onProject = location.pathname.startsWith("/project/");
    void import("@/three/core/renderer").then(({ renderer }) => {
      if (onChat || onProject) renderer.setIsActive(false);
    });
  }, [location.pathname]);

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

  return (
    <>
      <Header />
      <AppRoutes />
      <AdminPanel />
    </>
  );
}
