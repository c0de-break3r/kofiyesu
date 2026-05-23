import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Hero } from "@/features/home/Hero";
import { About } from "@/features/home/About";
import { Projects } from "@/features/home/Projects";
import { ContactSection } from "@/features/home/ContactSection";
import { Footer } from "@/components/layout/Footer";
import { ThreeScene } from "@/components/three/ThreeScene";

export function HomePage() {
  const aboutSpacerRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const contentDescriptionRef = useRef<HTMLDivElement>(null);
  const contentServicesRef = useRef<HTMLDivElement>(null);
  const contentDetailsRef = useRef<HTMLDivElement>(null);
  const contentProgressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void import("@/three/core/renderer").then(({ renderer }) => renderer.setIsActive(true));
  }, []);

  useEffect(() => {
    const about = aboutSpacerRef.current;
    const contact = contactRef.current;
    const contentDescription = contentDescriptionRef.current;
    const contentServices = contentServicesRef.current;
    const contentDetails = contentDetailsRef.current;
    const contentProgressCount = contentProgressRef.current;

    if (!about || !contentDescription || !contentServices || !contentDetails || !contentProgressCount) {
      return;
    }

    const tlDescription = gsap.timeline({ paused: true });
    const tlServices = gsap.timeline({ paused: true });
    const tlDetails = gsap.timeline({ paused: true });

    let destroyed = false;

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

      if (contact) transitions.contact.setup(contact);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    return () => {
      destroyed = true;
      void import("@/animations").then(({ transitions }) => {
        transitions.about.destroy();
        if (contact) transitions.contact.destroy();
      });
    };
  }, []);

  return (
    <div className="relative pb-[calc(88px+env(safe-area-inset-bottom,0px))] md:pb-0">
      <div className="relative">
        <div className="sticky top-0 z-0 h-[100dvh] w-full overflow-hidden">
          <ThreeScene />
          <div className="pointer-events-none absolute inset-0 opacity-0" aria-hidden>
            <div ref={contentDetailsRef} className="h-full w-full" />
            <div ref={contentDescriptionRef} className="h-full w-full" />
            <div ref={contentServicesRef} className="h-full w-full" />
            <div ref={contentProgressRef} className="h-full w-full" />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 min-h-[100dvh]">
          <div className="pointer-events-auto">
            <Hero />
          </div>
        </div>

        <div className="hidden h-[200px] md:block" aria-hidden />
      </div>

      <div ref={aboutSpacerRef} id="about" className="min-h-[250dvh]" aria-hidden />
      <About />
      <Projects />
      <div ref={contactRef}>
        <ContactSection />
      </div>
      <Footer />
    </div>
  );
}
