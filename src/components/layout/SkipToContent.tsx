export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--color-accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
    >
      Skip to content
    </a>
  );
}
