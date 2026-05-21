import { createApp } from "vue";
import "./assets/styles/index.scss";
import App from "./App.vue";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { initTheme } from "./composables/useTheme";
import { clerkPublishableKey, isClerkConfigured } from "./lib/clerk";

gsap.registerPlugin(ScrollTrigger);
initTheme("dark");

const app = createApp(App);

// Mount first so the preloader can dismiss; load Clerk in the background (awaiting blocks first paint).
if (isClerkConfigured) {
  void import("@clerk/vue")
    .then(({ clerkPlugin }) => {
      app.use(clerkPlugin, { publishableKey: clerkPublishableKey! });
    })
    .catch((err) => {
      console.error("[Clerk] Failed to load auth — continuing without sign-in.", err);
    });
} else {
  console.warn(
    "[Clerk] VITE_CLERK_PUBLISHABLE_KEY is missing — client sign-in, chat, and admin auth are disabled.",
  );
}

app.mount("#app");
