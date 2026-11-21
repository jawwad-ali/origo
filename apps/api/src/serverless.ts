import "./instrument";
import "reflect-metadata";
import { type IncomingMessage, type ServerResponse } from "node:http";
import { createApp } from "./bootstrap/create-app";

type RequestHandler = (req: IncomingMessage, res: ServerResponse) => void;

let handler: Promise<RequestHandler> | undefined;

/** One Nest app per function instance, created on the first request and reused while the instance lives. */
const getHandler = (): Promise<RequestHandler> => {
  handler ??= createApp()
    .then(async ({ app }) => {
      await app.init();
      return app.getHttpAdapter().getInstance() as RequestHandler;
    })
    .catch((error: unknown) => {
      handler = undefined; // let the next request try again instead of caching the failure
      throw error;
    });
  return handler;
};

/** Entry for serverless hosts (Vercel Functions, see api/index.js): every request goes through Express. */
const serverlessHandler = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  const app = await getHandler();
  app(req, res);
};

export default serverlessHandler;
