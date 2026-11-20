import { type ProblemDetailsDto } from "@origo/shared";

const FALLBACK_TITLE = "Something went wrong";

const isProblem = (value: unknown): value is ProblemDetailsDto =>
  typeof value === "object" && value !== null && "title" in value && "status" in value;

/** An API error carrying the RFC 9457 problem details the API sent back. */
export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetailsDto;

  constructor(problem: ProblemDetailsDto) {
    super(problem.detail ?? problem.title);
    this.name = "ApiError";
    this.status = problem.status;
    this.problem = problem;
  }

  /** Field errors keyed by dotted path, e.g. "organization.licenseNumber". */
  get fieldErrors(): Record<string, string[]> {
    return this.problem.errors ?? {};
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    const body: unknown = await response.json().catch(() => null);
    if (isProblem(body)) return new ApiError(body);
    return new ApiError({ type: "about:blank", title: FALLBACK_TITLE, status: response.status });
  }

  static network(): ApiError {
    return new ApiError({
      type: "about:blank",
      title: "Can't reach Origo",
      status: 0,
      detail: "Check your connection and try again.",
    });
  }
}
