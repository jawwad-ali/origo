import { randomUUID } from "node:crypto";
import { type IncomingMessage, type ServerResponse } from "node:http";
import { type Params } from "nestjs-pino";
import { type AppConfigService } from "./config/app-config.service";

const REQUEST_ID_HEADER = "x-request-id";
const REQUEST_ID_PATTERN = /^[a-zA-Z0-9-]{8,64}$/;

/** Reuses a well-formed incoming request ID (from Caddy or the web app) or makes a new one. */
const requestId = (req: IncomingMessage, res: ServerResponse): string => {
  const incoming = req.headers[REQUEST_ID_HEADER];
  const id = typeof incoming === "string" && REQUEST_ID_PATTERN.test(incoming) ? incoming : randomUUID();
  res.setHeader(REQUEST_ID_HEADER, id);
  return id;
};

export const buildLoggerParams = (config: AppConfigService): Params => ({
  pinoHttp: {
    level: config.get("LOG_LEVEL"),
    genReqId: requestId,
    redact: {
      paths: ["req.headers.cookie", "req.headers.authorization", 'res.headers["set-cookie"]'],
      censor: "[redacted]",
    },
    autoLogging: { ignore: (req) => req.url?.includes("/health/") ?? false },
    ...(config.isProduction ? {} : { transport: { target: "pino-pretty", options: { singleLine: true } } }),
  },
});
