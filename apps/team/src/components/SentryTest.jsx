import * as Sentry from "@sentry/react";

export default function SentryTest() {
  return (
    <button
      style={{ margin: "20px", padding: "10px" }}
      onClick={() => Sentry.captureException(new Error("Sentry test"))}
    >
      Test Sentry
    </button>
  );
}
