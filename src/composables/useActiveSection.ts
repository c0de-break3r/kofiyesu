import { ref, onMounted, onUnmounted } from "vue";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lenis } from "./useScroll";

export type ScrollSection = "hero" | "about" | "projects";

const scrollSections: ScrollSection[] = ["hero", "about", "projects"];

export function useActiveSection() {
  const activeSection = ref<ScrollSection | null>(null);
  const triggers: ScrollTrigger[] = [];

  const scrollTo = (section: ScrollSection) => {
    if (!lenis.value) return;
    lenis.value.scrollTo(section === "hero" ? 0 : `#${section}`);
  };

  onMounted(() => {
    scrollSections.forEach((section) => {
      const trigger = section === "hero" ? "#hero" : `#${section}`;
      const st = ScrollTrigger.create({
        trigger,
        start: section === "hero" ? "top 40%" : section === "about" ? "top 30%" : "top center",
        end: "bottom center",
        onEnter: () => {
          activeSection.value = section;
        },
        onEnterBack: () => {
          activeSection.value = section;
        },
      });
      triggers.push(st);
    });
  });

  onUnmounted(() => {
    triggers.forEach((st) => st.kill());
    triggers.length = 0;
  });

  return { activeSection, scrollTo };
}
