import { HeroSection } from "@/features/home/HeroSection";
import { ExperienceSection } from "@/features/home/ExperienceSection";
import { ProofOfWorkSection } from "@/features/home/ProofOfWorkSection";
import { CurrentlyBuildingSection } from "@/features/home/CurrentlyBuildingSection";
import { ContributionsSection } from "@/features/home/ContributionsSection";
import { StackSection } from "@/features/home/StackSection";
import { SelectedWorkSection } from "@/features/home/SelectedWorkSection";
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
      <ExperienceSection />
      <ProofOfWorkSection />
      <CurrentlyBuildingSection />
      <ContributionsSection />
      <StackSection />
      <SelectedWorkSection />
      <ConnectSection />
      <Footer />
    </div>
  );
}
