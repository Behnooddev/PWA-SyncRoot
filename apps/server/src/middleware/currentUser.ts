import type { NextFunction, Request, Response } from "express";
import { BadRequestError } from "@/lib/errors.js";
import { userService } from "@/modules/users/user.module.js";
import type { CurrentUser } from "@syncroot/shared-types";

/**
 * V1 has no authentication (see PHASE_0_PLANNING.md §1). Every client
 * request instead carries the locally-stored username in the X-User-Name
 * header. This middleware validates the header, resolves it to (or
 * creates) a User row via UserService, and attaches the result as
 * `req.currentUser` — every controller downstream can rely on it being
 * present without re-deriving it itself.
 *
 * Mounted globally in app.ts for all /api/* routes except /api/health.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      currentUser: CurrentUser;
    }
  }
}

export async function resolveCurrentUser(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const rawName = req.header("X-User-Name");

  if (!rawName || rawName.trim().length === 0) {
    throw new BadRequestError("Missing required X-User-Name header");
  }

  const name = rawName.trim();
  if (name.length > 50) {
    throw new BadRequestError("X-User-Name header must be 50 characters or fewer");
  }

  const user = await userService.findOrCreateByName(name);
  req.currentUser = { id: user.id, name: user.name };
  next();
}
