import type { NextConfig } from "next";

const apiUrl = process.env.API_URL;
if (!apiUrl) throw new Error("API_URL is not set. Copy apps/web/.env.example to .env.local.");

const isDev = process.env.NODE_ENV !== "production";

/**
 * Same-origin only: the API is reached through the rewrite below, fonts are self-hosted by next/font
 * and QR codes are inline SVG. 'unsafe-inline' scripts are needed for Next's inline bootstrap
 * without per-request nonces; dev additionally needs eval and the HMR websocket.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@origo/shared"],
  /**
   * The browser talks to the API through this same origin, so auth cookies stay
   * first-party (no cross-site cookies between Vercel and the API domain).
   */
  rewrites: async () => [{ source: "/api/v1/:path*", destination: `${apiUrl}/api/v1/:path*` }],
  headers: async () => [{ source: "/:path*", headers: securityHeaders }],
};

export default nextConfig;
