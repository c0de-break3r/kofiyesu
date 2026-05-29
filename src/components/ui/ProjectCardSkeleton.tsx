export function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="aspect-video animate-pulse bg-[var(--border)]" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-5 w-2/3 animate-pulse rounded bg-[var(--border)]" />
        <div className="flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-[var(--border)]" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-[var(--border)]" />
        </div>
        <div className="h-4 w-full animate-pulse rounded bg-[var(--border)]" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--border)]" />
      </div>
    </div>
  );
}
