import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

/**
 * Wraps route handlers with request validation. On success, the parsed
 * (and type-coerced/defaulted) values REPLACE req.body/params/query, so
 * controllers downstream read already-validated, already-typed data
 * instead of re-parsing. On failure, the thrown ZodError is caught by the
 * centralized errorHandler (see middleware/errorHandler.ts) — this
 * function itself never sends a response.
 *
 * Usage: router.post("/", validate({ body: createProjectSchema }), controller.create)
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // ZodSchema without a type parameter defaults its output to `any` —
    // unavoidable here since this middleware is intentionally generic
    // over whatever schema each route passes in. The controller layer is
    // where the concrete, non-`any` type comes back (see project.routes.ts
    // passing typed schemas, and the Request<Params, ...> generics on
    // ProjectController's methods).
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    if (schemas.params) {
      req.params = schemas.params.parse(req.params) as typeof req.params;
    }
    if (schemas.query) {
      req.query = schemas.query.parse(req.query) as typeof req.query;
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    next();
  };
}
