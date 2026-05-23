import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import App from "./App";
import { clerkPublishableKey, isClerkConfigured } from "./lib/clerk";
import "./index.css";

gsap.registerPlugin(ScrollTrigger);

const bootstrap = () => {
  const root = createRoot(document.getElementById("root")!);

  const app = (
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );

  if (isClerkConfigured) {
    root.render(<ClerkProvider publishableKey={clerkPublishableKey!}>{app}</ClerkProvider>);
  } else {
    console.warn("[Clerk] VITE_CLERK_PUBLISHABLE_KEY missing — auth disabled.");
    root.render(app);
  }

  requestAnimationFrame(() => {
    document.body.classList.remove("is-loading");
    document.querySelector(".preloader")?.classList.add("preloader-hidden");
  });
};

bootstrap();
