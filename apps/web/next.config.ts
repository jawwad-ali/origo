import type { NextConfig } from "next";

const apiUrl = process.env.API_URL;
if (!apiUrl) throw new Error("API_URL is not set. Copy apps/web/.env.example to .env.local.");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
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
