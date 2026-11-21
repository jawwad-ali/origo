import { z } from "zod";

export const LABEL_EXPORT_RUNNERS = ["queue", "inline"] as const;
export const LABEL_EXPORT_STORAGES = ["disk", "database"] as const;

/** An optional secret where an empty value (`KEY=` in a .env file) means "not set". */
const optionalSecret = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(32).optional(),
);

const booleanString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.url(),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  COOKIE_SECURE: booleanString,
  /**
   * Reverse proxies in front of the API whose X-Forwarded-For we trust, so rate limits and
   * audit logs see the real client IP. Production: 2 (Vercel's rewrite proxy, then Caddy).
   */
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(1),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  SENTRY_DSN: z.string().optional().default(""),

  /** Redis for BullMQ job queues. */
  REDIS_URL: z.url().default("redis://localhost:6379"),

  /** Public base of the patient verification page; QR codes point here. */
  VERIFY_BASE_URL: z.url(),
  /** Ed25519 key that signs QR codes. Base64 of a PKCS#8 DER private key; see scripts/generate-qr-key.ts. */
  QR_SIGNING_PRIVATE_KEY: z.string().min(40, "QR_SIGNING_PRIVATE_KEY is missing"),
  /** Short ID printed with each signature so keys can be rotated. */
  QR_SIGNING_KEY_ID: z.string().regex(/^[a-z0-9]{1,8}$/, "Use 1-8 lowercase letters or digits"),

  /**
   * How label PDFs are built: "queue" hands them to the BullMQ worker (needs Redis); "inline" builds
   * them in the API process right after responding, for serverless hosts with no Redis or worker.
   */
  LABEL_EXPORT_RUNNER: z.enum(LABEL_EXPORT_RUNNERS).default("queue"),
  /** Where finished PDFs live: "disk" (LABEL_EXPORT_DIR, shared volume) or "database" (no shared disk). */
  LABEL_EXPORT_STORAGE: z.enum(LABEL_EXPORT_STORAGES).default("disk"),
  /** Where finished label PDFs are written with disk storage. Shared by the API and the worker. */
  LABEL_EXPORT_DIR: z.string().min(1).default("./var/label-exports"),
  LABEL_EXPORT_TTL_HOURS: z.coerce.number().int().positive().default(24),
  /** Bearer secret for scheduled maintenance calls (Vercel Cron). Unset disables those routes. */
  CRON_SECRET: optionalSecret,

  /** Key for hashing scanners' IPs, so repeat scans can be counted without storing any IP. */
  SCAN_HASH_SECRET: z.string().min(32, "SCAN_HASH_SECRET must be at least 32 characters"),
  /**
   * Shared with the web app. Location headers on public verify calls are trusted only when this
   * secret comes with them, so nobody can fake a scan's city by calling the API directly.
   */
  WEB_PROXY_SECRET: optionalSecret,

  /** Turns on the public demo endpoints (sample packs). Never enable on a real deployment with real data. */
  DEMO_MODE: booleanString,

  /**
   * Runs the queue consumers inside the API process instead of a separate worker. For single-instance
   * hosts that can't run a second process (free tiers). Keep false when the worker runs on its own.
   */
  RUN_WORKER_IN_API: booleanString,
});

export type Env = z.infer<typeof envSchema>;

export type LabelExportRunner = Env["LABEL_EXPORT_RUNNER"];
export type LabelExportStorage = Env["LABEL_EXPORT_STORAGE"];

/** Settings that decide which modules load, so they are read before the Nest container exists. */
export interface BootstrapOptions {
  /** Consume the job queue inside the API process (RUN_WORKER_IN_API). */
  embeddedWorker: boolean;
  labelExports: { runner: LabelExportRunner; storage: LabelExportStorage };
}

const bootstrapSchema = envSchema
  .pick({ RUN_WORKER_IN_API: true, LABEL_EXPORT_RUNNER: true, LABEL_EXPORT_STORAGE: true })
  .refine((env) => !(env.RUN_WORKER_IN_API && env.LABEL_EXPORT_RUNNER === "inline"), {
    message: "RUN_WORKER_IN_API needs LABEL_EXPORT_RUNNER=queue; the inline runner has no queue to consume.",
  });

export const readBootstrapOptions = (env: NodeJS.ProcessEnv = process.env): BootstrapOptions => {
  const parsed = bootstrapSchema.parse(env);
  return {
    embeddedWorker: parsed.RUN_WORKER_IN_API,
    labelExports: { runner: parsed.LABEL_EXPORT_RUNNER, storage: parsed.LABEL_EXPORT_STORAGE },
  };
};
