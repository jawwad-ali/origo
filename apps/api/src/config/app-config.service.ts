import { Injectable } from "@nestjs/common";
import { type Env } from "./env.schema";
import { loadEnv } from "./load-env";

/** The only place in the API that reads environment variables. */
@Injectable()
export class AppConfigService {
  private readonly env: Env = loadEnv();

  get<K extends keyof Env>(key: K): Env[K] {
    return this.env[key];
  }

  get isProduction(): boolean {
    return this.env.NODE_ENV === "production";
  }
}
