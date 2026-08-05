import type { UserEntity, UserRepository } from "@/modules/users/user.repository.js";

/**
 * Injectable dependency, not a singleton import — the constructor takes
 * its repository instead of importing one directly, so tests can pass a
 * fake repository without touching a real database. The real singleton
 * instance is composed once, in user.module.ts.
 */
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * V1 has no signup flow — a user "exists" the first time their name
   * shows up in the X-User-Name header. Called by resolveCurrentUser
   * middleware on every request. Uses an atomic upsert (see
   * UserRepository.upsertByName) rather than find-then-create, to avoid a
   * race between two concurrent first-time requests from the same name.
   */
  findOrCreateByName(name: string): Promise<UserEntity> {
    return this.userRepository.upsertByName(name);
  }
}
