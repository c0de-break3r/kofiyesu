import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { clerkPublishableKey, isClerkConfigured } from "./lib/clerk";
import { scheduleResourceLoading } from "./utils/resources";
import "./index.css";

if (import.meta.env.PROD) {
  void import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({ immediate: true });
  });
}

gsap.registerPlugin(ScrollTrigger);

const bootstrap = () => {
  const root = createRoot(document.getElementById("root")!);

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

  requestAnimationFrame(() => {
    document.body.classList.remove("is-loading");
    document.querySelector(".preloader")?.classList.add("preloader-hidden");
  });
};

bootstrap();
