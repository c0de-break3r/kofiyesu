import { Hero } from "@/features/home/Hero";
import { Projects } from "@/features/home/Projects";
import { About } from "@/features/home/About";
import { ContactSection } from "@/features/home/ContactSection";
import { Footer } from "@/components/layout/Footer";
import { t } from "@/i18n/en";

const capabilities = [
  {
    title: "Build products",
    body: "Web apps, SaaS platforms, marketplaces, APIs and service platforms — from idea to shipped interface.",
  },
  {
    title: "Develop AI workflows",
    body: "Intelligent assistants, creative automation and AI-enabled product features grounded in real workflows.",
  },
  {
    title: "Engineer secure systems",
    body: "Authentication, access control, API security, validation and secure development practices baked into delivery.",
  },
  {
    title: "Ship & maintain",
    body: "Databases, deployment, monitoring, debugging and production improvements that keep software reliable.",
  },
];

function Capabilities() {
  return (
    <section
      id="capabilities"
      className="relative w-full bg-[var(--surface-dark)] px-6 py-16 text-white md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-accent)]">
          {t("capabilities-kicker")}
        </span>
        <h2 className="max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
          {t("capabilities-heading")}
        </h2>

        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
          {capabilities.map((item) => (
            <div key={item.title} className="flex flex-col gap-2 bg-[var(--surface-dark)] p-6 md:p-8">
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-white/60">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <div
      id="main-content"
      className="relative pb-[calc(72px+env(safe-area-inset-bottom,0px))] md:pb-0"
    >
      <Hero />

      <div id="projects" className="relative">
        <Projects />
      </div>

      <Capabilities />

      <div id="about" className="relative">
        <About />
      </div>

      <div id="contact" className="relative">
        <ContactSection />
      </div>

      <Footer className="pb-[calc(72px+env(safe-area-inset-bottom,0px))] md:pb-12" />
    </div>
  );
}

