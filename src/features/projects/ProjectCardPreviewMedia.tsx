import { useRef, useState } from "react";

interface Props {
  title: string;
  thumbnail?: string;
  previewVideo?: string;
}

/** Grid card media — thumbnail with optional hover/tap preview clip. */
export function ProjectCardPreviewMedia({ title, thumbnail, previewVideo }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  const play = () => {
    if (!previewVideo) return;
    setActive(true);
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => {});
  };

  const pause = () => {
    setActive(false);
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <div
      className="relative aspect-video overflow-hidden bg-[color-mix(in_srgb,var(--color-accent)_6%,var(--surface-projects))]"
      onMouseEnter={play}
      onMouseLeave={pause}
      onFocus={play}
      onBlur={pause}
      onTouchStart={play}
      onTouchEnd={pause}
      onTouchCancel={pause}
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={title}
          className={`h-full w-full object-cover transition duration-500 ${
            previewVideo && active ? "scale-[1.03] opacity-0" : "group-hover:scale-[1.03]"
          }`}
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {title}
        </div>
      )}
      {previewVideo ? (
        <video
          ref={videoRef}
          src={previewVideo}
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
          aria-hidden
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            active ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,color-mix(in_srgb,var(--text)_8%,transparent))] transition-opacity duration-300 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
