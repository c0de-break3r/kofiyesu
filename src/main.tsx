import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { initSentry, type SentryErrorHandler } from "./instrument";
import {
  isChunkLoadError,
  recoverFromStaleDeploy,
  markDeployHealthy,
  installChunkLoadRecovery,
} from "./lib/lazyWithRetry";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";
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

const bootstrap = async () => {
  const reportToSentry: SentryErrorHandler | null = await initSentry();

  const sentryRootOptions = reportToSentry
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

  root.render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>,
  );
};

void bootstrap();
