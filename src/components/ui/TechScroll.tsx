import { useState } from "react";
import type { ComponentType } from "react";
import {
  SiTypescript,
  SiJavascript,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiExpress,
  SiTailwindcss,
  SiPostgresql,
  SiPython,
  SiGit,
  SiVite,
} from "react-icons/si";

/**
 * Real brand logos via react-icons (SimpleIcons set). These render as inline
 * SVG compiled into the JS bundle, so they stay within the site's self-contained
 * `img-src 'self'` CSP — no external image requests.
 */
type TechInfo = {
  Icon: ComponentType<{ size?: number | string; color?: string }>;
  color: string;
  /** One-line summary shown in the drop card on hover. */
  about: string;
};

const TECH: Record<string, TechInfo> = {
  TypeScript: {
    Icon: SiTypescript,
    color: "#3178c6",
    about: "Typed JavaScript — catches bugs early and keeps large codebases safe to change.",
  },
  JavaScript: {
    Icon: SiJavascript,
    color: "#f7df1e",
    about: "The language of the web — powers interactive behaviour in the browser.",
  },
  React: {
    Icon: SiReact,
    color: "#61dafb",
    about: "Component-based library for building fast, interactive user interfaces.",
  },
  "Next.js": {
    Icon: SiNextdotjs,
    color: "#e5e5e5",
    about: "React framework with routing, server rendering and tooling for production apps.",
  },
  "Node.js": {
    Icon: SiNodedotjs,
    color: "#5fa04e",
    about: "Runs JavaScript on the server to build scalable backends and APIs.",
  },
  "Express.js": {
    Icon: SiExpress,
    color: "#e5e5e5",
    about: "Minimal Node.js framework for APIs, routing and middleware.",
  },
  "Tailwind CSS": {
    Icon: SiTailwindcss,
    color: "#38bdf8",
    about: "Utility-first CSS for styling responsive interfaces quickly.",
  },
  PostgreSQL: {
    Icon: SiPostgresql,
    color: "#4169e1",
    about: "Reliable relational database for structured and complex data.",
  },
  Python: {
    Icon: SiPython,
    color: "#3776ab",
    about: "Versatile language for scripting, automation and AI/ML work.",
  },
  Git: {
    Icon: SiGit,
    color: "#f05030",
    about: "Version control for tracking changes and collaborating on code.",
  },
  Vite: {
    Icon: SiVite,
    color: "#646cff",
    about: "Fast build tool and dev server for modern frontend projects.",
  },
};

function FallbackBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-md bg-[var(--color-accent)] text-sm font-black text-white">
      {name.slice(0, 1)}
    </span>
  );
}

/**
 * Continuously scrolling technology marquee. It pauses on hover and, when a
 * technology is hovered, drops in a card previewing what that stack does.
 * The animation lives in index.css (`.tech-marquee`, `vt-marquee`).
 */
export function TechScroll({ technologies }: { technologies: readonly string[] }) {
  const [active, setActive] = useState<string | null>(null);
  // Duplicate the list so the -50% keyframe loops seamlessly.
  const loop = [...technologies, ...technologies];
  const info = active ? TECH[active] : null;

  return (
    <div className="tech-marquee relative w-full">
      <div className="tech-marquee__viewport relative py-2">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[var(--bg)] to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[var(--bg)] to-transparent"
        />
        <ul className="tech-marquee__track">
          {loop.map((tech, i) => {
            const entry = TECH[tech];
            return (
              <li
                key={`${tech}-${i}`}
                onMouseEnter={() => setActive(tech)}
                onMouseLeave={() => setActive(null)}
                className="flex shrink-0 cursor-default snap-start items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 transition-colors hover:border-[var(--border-strong)]"
              >
                {entry ? (
                  <entry.Icon size={30} color={entry.color} />
                ) : (
                  <FallbackBadge name={tech} />
                )}
                <span className="whitespace-nowrap text-sm font-semibold text-[var(--text)]">
                  {tech}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Reserved height so the card never shifts the layout. */}
      <div className="relative mt-5 flex min-h-[96px] justify-center">
        {info ? (
          <div
            key={active}
            role="status"
            className="tech-card flex w-full max-w-md items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-left shadow-[0_18px_40px_-24px_rgba(0,0,0,0.5)]"
          >
            <span className="mt-0.5 shrink-0">
              <info.Icon size={26} color={info.color} />
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--text)]">{active}</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
                {info.about}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
