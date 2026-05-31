import "./instrument";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { reactErrorHandler } from "@sentry/react";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { clerkPublishableKey, isClerkConfigured } from "./lib/clerk";
import { isSentryConfigured } from "./instrument";
import { prefetchSiteContent } from "./lib/prefetchSiteContent";
import { scheduleResourceLoading } from "./utils/resources";
import "./index.css";

if (import.meta.env.PROD) {
  void import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({ immediate: true });
  });
}

gsap.registerPlugin(ScrollTrigger);

prefetchSiteContent();

const bootstrap = () => {
  const sentryRootOptions = isSentryConfigured()
    ? {
        onUncaughtError: reactErrorHandler(),
        onCaughtError: reactErrorHandler(),
        onRecoverableError: reactErrorHandler(),
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

  if (isClerkConfigured) {
    root.render(<ClerkProvider publishableKey={clerkPublishableKey!}>{app}</ClerkProvider>);
  } else {
    console.warn("[Clerk] VITE_CLERK_PUBLISHABLE_KEY missing — auth disabled.");
    root.render(app);
  }

  scheduleResourceLoading();
};

bootstrap();
