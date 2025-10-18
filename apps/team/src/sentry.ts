import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_SENTRY_ENV ?? "production",
  release: import.meta.env.VITE_SENTRY_RELEASE,
  tracesSampleRate: 0
});
