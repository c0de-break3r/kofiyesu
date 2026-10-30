import { HeroSection } from "@/features/home/HeroSection";
import { ProofOfWorkSection } from "@/features/home/ProofOfWorkSection";
import { ContributionsSection } from "@/features/home/ContributionsSection";
import { AboutSection } from "@/features/home/AboutSection";
import { StackSection } from "@/features/home/StackSection";
import { ConnectSection } from "@/features/home/ConnectSection";
import { Footer } from "@/components/layout/Footer";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { profile } from "@/data/profile";

/** One-page portfolio: anchor sections with deep routes kept for sub-pages. */
export function HomePage() {
  useDocumentMeta({
    title: `${profile.name} — Software Engineer`,
    description: profile.intro,
    canonicalPath: "/",
  });

  return (
    <div id="main-content" className="relative">
      <HeroSection />
      <ProofOfWorkSection />
      <ContributionsSection />
      <AboutSection />
      <StackSection />
      <ConnectSection />
      <Footer />
    </div>
  );
}
