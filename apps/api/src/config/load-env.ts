import { envSchema, type Env } from "./env.schema";

/** Parses process.env once at boot. Any missing or invalid value stops the app with a clear message. */
export const loadEnv = (source: NodeJS.ProcessEnv = process.env): Env => {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
};
