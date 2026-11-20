import * as Sentry from "@sentry/nestjs";
import { loadEnv } from "./config/load-env";

// Imported first in main.ts so Sentry can hook into modules before they load.
const env = loadEnv();

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1,
    sendDefaultPii: false,
  });
}
