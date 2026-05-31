import { useRef } from "react";

interface Props {
  title: string;
  thumbnail?: string;
  previewVideo?: string;
}

/** Grid card media — thumbnail with optional hover preview clip. */
export function ProjectCardPreviewMedia({ title, thumbnail, previewVideo }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const play = () => {
    if (!previewVideo) return;
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => {});
  };

  const pause = () => {
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
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={title}
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] ${
            previewVideo ? "group-hover:opacity-0" : ""
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
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
        />
      ) : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,color-mix(in_srgb,var(--text)_8%,transparent))] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
    </div>
  );
}
