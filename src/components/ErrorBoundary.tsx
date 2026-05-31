import * as Sentry from "@sentry/react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { isChunkLoadError, recoverFromStaleDeploy } from "@/lib/lazyWithRetry";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isChunkLoadError(error)) {
      void recoverFromStaleDeploy();
      return;
    }

    console.error("[App] Uncaught render error:", error, info.componentStack);
    Sentry.captureException(error, {
      contexts: { react: { componentStack: info.componentStack } },
    });
  }

  render() {
    if (this.state.error) {
      const staleDeploy = isChunkLoadError(this.state.error);

      return (
        <main className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-24 text-center">
          <p className="text-lg font-bold">
            {staleDeploy ? "A new version is available" : "Something went wrong"}
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            {staleDeploy
              ? "The site was updated while you had it open. Reload to load the latest version."
              : "Try refreshing the page. If this keeps happening, check the browser console for details."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-bold text-white"
          >
            Reload
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
