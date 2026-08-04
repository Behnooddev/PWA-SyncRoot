/**
 * Base class for all operational errors we throw on purpose (as opposed to
 * bugs). Services and repositories throw these; the errorHandler middleware
 * is the only place that knows how to turn them into an HTTP response.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: Record<string, unknown> | undefined;

  constructor(params: {
    statusCode: number;
    code: string;
    message: string;
    details?: Record<string, unknown> | undefined;
  }) {
    super(params.message);
    this.name = "AppError";
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.details = params.details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super({
      statusCode: 404,
      code: "NOT_FOUND",
      message: id ? `${resource} with id "${id}" was not found` : `${resource} was not found`,
    });
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ statusCode: 422, code: "VALIDATION_ERROR", message, details });
    this.name = "ValidationError";
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ statusCode: 400, code: "BAD_REQUEST", message, details });
    this.name = "BadRequestError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ statusCode: 409, code: "CONFLICT", message, details });
    this.name = "ConflictError";
  }
}
