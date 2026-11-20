import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { type ProblemDetailsDto } from "@origo/shared";
import { Prisma } from "@prisma/client";
import * as Sentry from "@sentry/nestjs";
import { type Request, type Response } from "express";
import { DomainException } from "../exceptions/domain.exceptions";
import { ValidationException } from "../exceptions/validation.exception";

const PROBLEM_TYPE_BASE = "https://origo.dev/problems/";
const PRISMA_UNIQUE_VIOLATION = "P2002";

const problem = (status: number, code: string, title: string, detail?: string): ProblemDetailsDto => ({
  type: `${PROBLEM_TYPE_BASE}${code}`,
  title,
  status,
  ...(detail ? { detail } : {}),
});

/** Turns every error into an RFC 9457 problem details response with the request ID attached. */
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const body = this.toProblem(exception);
    body.instance = request.originalUrl;
    body.requestId = String(request.id ?? "");

    response.status(body.status).type("application/problem+json").json(body);
  }

  private toProblem(exception: unknown): ProblemDetailsDto {
    if (exception instanceof ValidationException) {
      return {
        ...problem(exception.status, exception.code, exception.title, exception.detail),
        errors: exception.errors,
      };
    }
    if (exception instanceof DomainException) {
      return problem(exception.status, exception.code, exception.title, exception.detail);
    }
    if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === PRISMA_UNIQUE_VIOLATION
    ) {
      return problem(
        HttpStatus.CONFLICT,
        "already-exists",
        "Already exists",
        "A record with these details already exists.",
      );
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status === HttpStatus.TOO_MANY_REQUESTS) {
        return problem(status, "rate-limited", "Too many requests", "Wait a minute and try again.");
      }
      return problem(status, `http-${status}`, exception.message);
    }

    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    Sentry.captureException(exception);
    return problem(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "internal-error",
      "Something went wrong",
      "Try again in a moment.",
    );
  }
}
