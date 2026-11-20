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
});

export type Env = z.infer<typeof envSchema>;
