import React from "react";
import * as Sentry from "@sentry/react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { isChunkLoadError } from "@/lib/lazyWithRetry";

const dsn = import.meta.env.VITE_SENTRY_DSN?.trim();

if (dsn) {
  const isProd = import.meta.env.PROD;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION,
    sendDefaultPii: true,
    integrations: [
      Sentry.reactRouterV7BrowserTracingIntegration({
        useEffect: React.useEffect,
        useLocation,
        useNavigationType,
        matchRoutes,
        createRoutesFromChildren,
      }),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: isProd ? 0.2 : 1.0,
    tracePropagationTargets: [
      "localhost",
      /^https?:\/\/(?:www\.)?kofiyesu\.com/,
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    enableLogs: true,
    ignoreErrors: [
      /^ChatHistoryError$/,
      /Could not reach chat sync/i,
      /Chat sync was cancelled/i,
      /^Sign in required$/,
    ],
    beforeSend(event, hint) {
      if (isChunkLoadError(hint.originalException)) return null;
      const message = event.exception?.values?.[0]?.value ?? "";
      if (isChunkLoadError(message)) return null;
      if (/Could not reach chat sync/i.test(message)) return null;

      const ex = hint.originalException;
      if (ex && typeof ex === "object" && (ex as Error).name === "ChatHistoryError") {
        const report =
          "reportToMonitoring" in ex
            ? Boolean((ex as { reportToMonitoring?: boolean }).reportToMonitoring)
            : false;
        if (!report) return null;
      }
      return event;
    },
  });
}

export const isSentryConfigured = () => Boolean(dsn);
