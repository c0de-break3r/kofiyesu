import { useEffect, useRef, useState } from "react";
import { Hero } from "@/features/home/Hero";
import { About } from "@/features/home/About";
import { Projects } from "@/features/home/Projects";
import { ContactSection } from "@/features/home/ContactSection";
import { Footer } from "@/components/layout/Footer";
import { ThreeScene } from "@/components/three/ThreeScene";

export function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroInView, setHeroInView] = useState(true);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroInView(entry?.isIntersecting ?? false),
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    void import("@/three/core/renderer").then(({ renderer }) => renderer.setIsActive(heroInView));
  }, [heroInView]);

  return (
    <div className="relative">
      <div ref={heroRef} className="relative min-h-[100dvh]">
        <ThreeScene visible={heroInView} />
        <Hero />
      </div>
      <About />
      <Projects />
      <ContactSection />
      <Footer />
    </div>
  );
}
