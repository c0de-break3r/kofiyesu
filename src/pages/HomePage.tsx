import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Hero } from "@/features/home/Hero";
import { About } from "@/features/home/About";
import { Projects } from "@/features/home/Projects";
import { ContactSection } from "@/features/home/ContactSection";
import { Footer } from "@/components/layout/Footer";
import { ThreeScene } from "@/components/three/ThreeScene";
import { getLenis } from "@/hooks/useScroll";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { resetHomeScene } from "@/animations/resetHomeScene";

export function HomePage() {
  const reducedMotion = useReducedMotion();
  const aboutSpacerRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const contentDescriptionRef = useRef<HTMLDivElement>(null);
  const contentServicesRef = useRef<HTMLDivElement>(null);
  const contentDetailsRef = useRef<HTMLDivElement>(null);
  const contentProgressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resetHomeScene();
    getLenis()?.scrollTo(0, { immediate: true });
    void import("@/three/core/renderer").then(({ renderer }) =>
      renderer.setIsActive(!reducedMotion),
    );
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    let destroyed = false;
    let retryTimer = 0;

    const setup = () => {
      const about = aboutSpacerRef.current;
      const contact = contactRef.current;
      const contentDescription = contentDescriptionRef.current;
      const contentServices = contentServicesRef.current;
      const contentDetails = contentDetailsRef.current;
      const contentProgressCount = contentProgressRef.current;

      if (
        !about ||
        !contact ||
        !contentDescription ||
        !contentServices ||
        !contentDetails ||
        !contentProgressCount ||
        !document.getElementById("hero-content-inner")
      ) {
        if (!destroyed) retryTimer = window.setTimeout(setup, 50);
        return;
      }

      const tlDescription = gsap.timeline({ paused: true });
      const tlServices = gsap.timeline({ paused: true });
      const tlDetails = gsap.timeline({ paused: true });

      void import("@/animations").then(({ transitions }) => {
        if (destroyed) return;

        transitions.about.setup({
          about,
          contentDescription,
          contentServices,
          contentDetails,
          contentProgressCount,
          tlDescription,
          tlServices,
          tlDetails,
        });

        transitions.contact.setup(contact);
        requestAnimationFrame(() => ScrollTrigger.refresh());
      });
    };

    setup();

    return () => {
      destroyed = true;
      window.clearTimeout(retryTimer);
      void import("@/animations").then(({ transitions }) => {
        transitions.about.destroy();
        transitions.contact.destroy();
      });
    };
  }, [reducedMotion]);

  return (
    <div id="main-content" className="relative pb-[calc(72px+env(safe-area-inset-bottom,0px))] md:pb-0">
      <div className="relative">
        <div className="sticky top-0 z-0 h-[100dvh] w-full overflow-hidden">
          {!reducedMotion ? <ThreeScene /> : (
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--room-bg)]/30 to-[var(--bg)]" aria-hidden />
          )}
          {!reducedMotion ? (
            <div className="pointer-events-none absolute inset-0 opacity-0" aria-hidden>
              <div ref={contentDetailsRef} className="h-full w-full" />
              <div ref={contentDescriptionRef} className="h-full w-full" />
              <div ref={contentServicesRef} className="h-full w-full" />
              <div ref={contentProgressRef} className="h-full w-full" />
            </div>
          ) : null}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 min-h-[100dvh]">
          <div className="pointer-events-auto">
            <Hero />
          </div>
        </div>

        <div className="hidden h-[200px] md:block" aria-hidden />
      </div>

      <div
        id="about"
        ref={aboutSpacerRef}
        className={`relative ${reducedMotion ? "min-h-0" : "min-h-[155dvh] md:min-h-[195dvh]"}`}
      >
        <div
          className={
            reducedMotion
              ? undefined
              : "sticky top-[calc(var(--height-header,4.5rem)+0.25rem)] z-10 bg-[var(--bg)] pb-2"
          }
        >
          <About />
        </div>
      </div>
      <div id="projects" className="relative -mt-1 md:mt-0">
        <Projects />
      </div>
      <div id="contact" ref={contactRef} className="relative">
        <ContactSection />
      </div>
      <Footer className="pb-[calc(72px+env(safe-area-inset-bottom,0px))] md:pb-12" />
    </div>
  );
}
