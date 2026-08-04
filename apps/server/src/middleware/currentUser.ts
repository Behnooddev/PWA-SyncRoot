import type { NextFunction, Request, Response } from "express";
import { BadRequestError } from "@/lib/errors.js";

/**
 * V1 has no authentication. Instead, every client request carries the
 * locally-stored username in the X-User-Name header. This middleware just
 * validates the header is present and well-formed; resolving it to (or
 * creating) an actual User row is the UserService's job, called from
 * within each module's controller — kept out of global middleware so it
 * stays a single, testable, explicit dependency rather than implicit magic
 * bolted onto every request.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userName: string;
    }
  }
}

export function requireUserNameHeader(req: Request, _res: Response, next: NextFunction): void {
  const userName = req.header("X-User-Name");

  if (!userName || userName.trim().length === 0) {
    throw new BadRequestError("Missing required X-User-Name header");
  }

  if (userName.length > 50) {
    throw new BadRequestError("X-User-Name header must be 50 characters or fewer");
  }

  req.userName = userName.trim();
  next();
}
