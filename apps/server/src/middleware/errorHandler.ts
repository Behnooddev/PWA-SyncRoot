import type { NextFunction, ParamsDictionary, Request, Response } from "express-serve-static-core";
import type { ParsedQs } from "qs";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors.js";
import { logger } from "@/lib/logger.js";
import type { ApiErrorBody } from "@syncroot/shared-types";

/**
 * Registered LAST in the middleware chain. Every thrown error in a route
 * handler (sync or async, as long as it's passed to next()) ends up here.
 * This is the single place that decides status codes and response shape —
 * no controller should ever call res.status(...).json(...) for an error.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, path: req.path }, err.message);
    } else {
      logger.warn({ code: err.code, path: req.path }, err.message);
    }

    const body: ApiErrorBody = {
      error: { code: err.code, message: err.message, details: err.details },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof ZodError) {
    const body: ApiErrorBody = {
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: { issues: err.flatten() },
      },
    };
    res.status(422).json(body);
    return;
  }

  // Unknown/unexpected error — never leak internals to the client.
  logger.error({ err, path: req.path }, "Unhandled error");
  const body: ApiErrorBody = {
    error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." },
  };
  res.status(500).json(body);
}

/** Wraps an async route handler so thrown/rejected errors reach errorHandler.
 * Generic over params/body/query so route-specific Request<> types (e.g.
 * Request<{ id: string }>) flow through instead of widening back to
 * Express's default ParamsDictionary — see project.routes.ts for usage. */
export function asyncHandler<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
>(
  fn: (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ) => Promise<unknown>,
) {
  return (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ): void => {
    fn(req, res, next).catch(next);
  };
}
