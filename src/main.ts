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

const app = createApp(App);

if (isClerkConfigured) {
  void import("@clerk/vue")
    .then(({ clerkPlugin }) => {
      app.use(clerkPlugin, { publishableKey: clerkPublishableKey! });
      markClerkReady();
    })
    .catch((err) => {
      console.error("[Clerk] Failed to load auth — continuing without sign-in.", err);
      markClerkReady();
    });
} else {
  markClerkReady();
}

app.mount("#app");
