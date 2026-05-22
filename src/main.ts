import { createApp } from "vue";
import "./assets/styles/index.scss";
import App from "./App.vue";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { initTheme } from "./composables/useTheme";
import { clerkPublishableKey, isClerkConfigured } from "./lib/clerk";
import { markClerkReady } from "./lib/clerkReady";

gsap.registerPlugin(ScrollTrigger);
initTheme("dark");

const bootstrap = async () => {
  const app = createApp(App);

  if (isClerkConfigured) {
    try {
      const { clerkPlugin } = await import("@clerk/vue");
      app.use(clerkPlugin, { publishableKey: clerkPublishableKey! });
    } catch (err) {
      console.error("[Clerk] Failed to load auth — continuing without sign-in.", err);
    }
  } else {
    console.warn(
      "[Clerk] VITE_CLERK_PUBLISHABLE_KEY is missing — client sign-in, chat, and admin auth are disabled.",
    );
  }

  markClerkReady();
  app.mount("#app");
};

void bootstrap();
