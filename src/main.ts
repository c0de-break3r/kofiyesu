import { createApp } from "vue";
import "./assets/styles/index.scss";
import App from "./App.vue";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { initTheme } from "./composables/useTheme";
import { clerkPublishableKey, isClerkConfigured } from "./lib/clerk";

gsap.registerPlugin(ScrollTrigger);
initTheme();

const app = createApp(App);

if (isClerkConfigured) {
  const { clerkPlugin } = await import("@clerk/vue");
  app.use(clerkPlugin, { publishableKey: clerkPublishableKey! });
} else {
  console.warn(
    "[Clerk] VITE_CLERK_PUBLISHABLE_KEY is missing — client sign-in, chat, and admin auth are disabled.",
  );
}

app.mount("#app");
