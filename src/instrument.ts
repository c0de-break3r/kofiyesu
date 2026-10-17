/**
 * Sentry is optional and env-gated. The SDK (plus replay + tracing) is
 * imported dynamically so it never lands in the initial bundle unless a DSN is
 * configured — keeping the portfolio lightweight and fast on mobile.
 */

const dsn = import.meta.env.VITE_SENTRY_DSN?.trim();

export const isSentryConfigured = () => Boolean(dsn);

export type SentryErrorHandler = (
  error: unknown,
  errorInfo: { componentStack?: string | null },
) => void;

/** Initialize Sentry when configured; return a React error handler, else null. */
export async function initSentry(): Promise<SentryErrorHandler | null> {
  if (!dsn) return null;

  try {
    const [Sentry, router] = await Promise.all([
      import("@sentry/react"),
      import("react-router-dom"),
    ]);

    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION,
      sendDefaultPii: true,
      integrations: [
        Sentry.reactRouterV7BrowserTracingIntegration({
          useEffect: (await import("react")).useEffect,
          useLocation: router.useLocation,
          useNavigationType: router.useNavigationType,
          matchRoutes: router.matchRoutes,
          createRoutesFromChildren: router.createRoutesFromChildren,
        }),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
      tracePropagationTargets: ["localhost", /^https?:\/\/(?:www\.)?kofiyesu\.com/],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });

    return Sentry.reactErrorHandler();
  } catch {
    // Monitoring must never block the app from booting.
    return null;
  }
}
