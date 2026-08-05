import { UserRepository } from "@/modules/users/user.repository.js";
import { UserService } from "@/modules/users/user.service.js";

/**
 * Each module has one of these: the single place that constructs the real
 * repository → service chain with actual dependencies. Everywhere else
 * (middleware, other modules, routes) imports `userService` from here
 * rather than constructing its own — one instance per process, easy to
 * swap for a fake in tests since tests construct UserService directly
 * with a mock repository instead of importing this file at all.
 */
export const userRepository = new UserRepository();
export const userService = new UserService(userRepository);
