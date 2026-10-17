import "./instrument";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { reactErrorHandler } from "@sentry/react";
import { BrowserRouter } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { isSentryConfigured } from "./instrument";
import { isChunkLoadError, recoverFromStaleDeploy } from "./lib/lazyWithRetry";
import { prefetchSiteContent } from "./lib/prefetchSiteContent";
import { markDeployHealthy, installChunkLoadRecovery } from "./lib/lazyWithRetry";
import "./index.css";

installChunkLoadRecovery();

if (import.meta.env.PROD) {
  void import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        window.location.reload();
      },
    });
  });

  if ("serviceWorker" in navigator) {
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  }
}

window.setTimeout(() => markDeployHealthy(), 5000);

gsap.registerPlugin(ScrollTrigger);

prefetchSiteContent();

const bootstrap = () => {
  const reportToSentry = reactErrorHandler();
  const sentryRootOptions = isSentryConfigured()
    ? {
        onUncaughtError: (error: unknown, errorInfo: { componentStack?: string | null }) => {
          if (isChunkLoadError(error)) {
            void recoverFromStaleDeploy();
            return;
          }
          reportToSentry(error, errorInfo);
        },
        onCaughtError: (error: unknown, errorInfo: { componentStack?: string | null }) => {
          if (isChunkLoadError(error)) {
            void recoverFromStaleDeploy();
            return;
          }
          reportToSentry(error, errorInfo);
        },
        onRecoverableError: reportToSentry,
      }
    : undefined;

  const root = createRoot(document.getElementById("root")!, sentryRootOptions);

  const app = (
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>
  );

  root.render(app);
};

bootstrap();
