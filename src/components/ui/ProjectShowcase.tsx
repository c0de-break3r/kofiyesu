import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiPause, FiPlay } from "react-icons/fi";

export type ShowcaseItem = {
  id: string;
  /** Small uppercase label above the headline (status / "In development"). */
  kicker: string;
  /** Bold product name. */
  headline: string;
  /** Optional one-line description. */
  body?: string;
  /** Screenshot that fills the card. When absent, a themed monogram tile shows. */
  image?: string;
  /** Detail-page link. Omitted for in-development items. */
  href?: string;
};

/**
 * Apple-style horizontal showcase: full-bleed image cards with a headline
 * overlaid on top, snap-scrolling, gentle auto-advance, and a bottom control
 * bar of progress dots + a play/pause button.
 */
export function ProjectShowcase({ items }: { items: ShowcaseItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  const indexRef = useRef(0);
  indexRef.current = activeIndex;

  const scrollToIndex = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>(".showcase__item");
    if (!item) return;
    const step = item.offsetWidth + 20;
    el.scrollTo({ left: i * step, behavior: "smooth" });
  }, []);

  // Keep the dots in sync with whichever card is centered.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const item = el.querySelector<HTMLElement>(".showcase__item");
      if (!item) return;
      const step = item.offsetWidth + 20;
      const idx = Math.round(el.scrollLeft / step);
      setActiveIndex(Math.max(0, Math.min(items.length - 1, idx)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [items.length]);

  // Auto-advance unless paused by the user or hovered.
  const running = !userPaused && !hovering;
  useEffect(() => {
    if (!running || items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      const next = (indexRef.current + 1) % items.length;
      scrollToIndex(next);
    }, 4500);
    return () => window.clearInterval(id);
  }, [running, items.length, scrollToIndex]);

  return (
    <div>
      <div
        ref={trackRef}
        className="showcase"
        role="region"
        aria-label="Selected projects"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocusCapture={() => setHovering(true)}
        onBlurCapture={() => setHovering(false)}
      >
        <div className="showcase__track">
          {items.map((item) => {
            const media = Boolean(item.image);
            const cardClass = `showcase__card${media ? " showcase__card--media" : ""}`;
            const inner = (
              <>
                {media ? (
                  <>
                    <div className="showcase__media">
                      <img
                        src={item.image}
                        alt={item.headline}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div aria-hidden className="showcase__scrim" />
                  </>
                ) : (
                  <div aria-hidden className="showcase__tile">
                    <span>{item.headline.charAt(0)}</span>
                  </div>
                )}
                <div className="showcase__head">
                  <span className="showcase__kicker">{item.kicker}</span>
                  <h3 className="showcase__headline">{item.headline}</h3>
                  {item.body ? <p className="showcase__body">{item.body}</p> : null}
                </div>
              </>
            );
            return (
              <article key={item.id} className="showcase__item">
                {item.href ? (
                  <Link to={item.href} className={cardClass}>
                    {inner}
                  </Link>
                ) : (
                  <div className={cardClass}>{inner}</div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      <div className="showcase__controls">
        <div className="showcase__dots" role="tablist" aria-label="Choose a project">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={item.headline}
              className={`showcase__dot${i === activeIndex ? " showcase__dot--active" : ""}`}
              onClick={() => scrollToIndex(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className="showcase__play"
          aria-label={userPaused ? "Play" : "Pause"}
          aria-pressed={!userPaused}
          onClick={() => setUserPaused((p) => !p)}
        >
          {userPaused ? <FiPlay aria-hidden /> : <FiPause aria-hidden />}
        </button>
      </div>
    </div>
  );
}
