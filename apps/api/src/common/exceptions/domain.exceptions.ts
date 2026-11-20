import { HttpStatus } from "@nestjs/common";

/**
 * Base for every expected business error. The global filter turns these into
 * RFC 9457 problem details, using `code` as the problem type.
 */
export class DomainException extends Error {
  constructor(
    readonly status: HttpStatus,
    readonly code: string,
    readonly title: string,
    readonly detail?: string,
  ) {
    super(detail ?? title);
  }
}

export class UnauthenticatedException extends DomainException {
  constructor(detail = "Sign in to continue.") {
    super(HttpStatus.UNAUTHORIZED, "unauthenticated", "Not signed in", detail);
  }
}

export class ForbiddenActionException extends DomainException {
  constructor(detail = "You don't have permission to do this.") {
    super(HttpStatus.FORBIDDEN, "forbidden", "Not allowed", detail);
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entity: string) {
    super(HttpStatus.NOT_FOUND, "not-found", `${entity} not found`);
  }
}

export class ConflictException extends DomainException {
  constructor(code: string, title: string, detail?: string) {
    super(HttpStatus.CONFLICT, code, title, detail);
  }
}

export class InvalidStateException extends DomainException {
  constructor(code: string, title: string, detail?: string) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, code, title, detail);
  }
}
