import nextPlugin from "@next/eslint-plugin-next";
import { baseConfig } from "./base.js";

/** Next.js app config: base rules plus Next's core-web-vitals rules. */
export const nextConfig = [
  ...baseConfig,
  {
    plugins: { "@next/next": nextPlugin },
    rules: { ...nextPlugin.configs.recommended.rules, ...nextPlugin.configs["core-web-vitals"].rules },
  },
  {
    // Next.js requires default-exported function declarations for these files.
    files: ["**/app/**/{page,layout,loading,error,not-found,template,default}.tsx"],
    rules: { "func-style": "off" },
  },
];
