import { z } from "zod";

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

  /** Where finished label PDFs are written. Shared by the API (download) and the worker (write). */
  LABEL_EXPORT_DIR: z.string().min(1).default("./var/label-exports"),
  LABEL_EXPORT_TTL_HOURS: z.coerce.number().int().positive().default(24),

  /** Key for hashing scanners' IPs, so repeat scans can be counted without storing any IP. */
  SCAN_HASH_SECRET: z.string().min(32, "SCAN_HASH_SECRET must be at least 32 characters"),
  /**
   * Shared with the web app. Location headers on public verify calls are trusted only when this
   * secret comes with them, so nobody can fake a scan's city by calling the API directly.
   */
  WEB_PROXY_SECRET: z.string().min(32).optional(),

  /** Turns on the public demo endpoints (sample packs). Never enable on a real deployment with real data. */
  DEMO_MODE: booleanString,
});

export type Env = z.infer<typeof envSchema>;
