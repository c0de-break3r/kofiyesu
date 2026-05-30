interface Props {
  src: string;
  poster?: string;
  title: string;
}

export function ProjectPreviewVideo({ src, poster, title }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--color-accent)_4%,#fafafa)]">
      <video
        src={src}
        poster={poster || undefined}
        title={`${title} preview`}
        muted
        loop
        playsInline
        autoPlay
        controls
        className="aspect-video w-full object-cover"
      />
    </div>
  );
}
