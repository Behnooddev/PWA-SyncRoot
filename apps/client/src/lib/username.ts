const STORAGE_KEY = "syncroot:username";

/**
 * V1 has no authentication (see PHASE_0_PLANNING.md). Instead, the app
 * asks for a name on first launch and stores it in localStorage. Every
 * subsequent request attaches it via the X-User-Name header (see
 * lib/axios.ts). Pulled in during Phase 1 rather than Phase 4 because the
 * axios client is structurally dependent on it from the start — the full
 * "ask on first launch" UI still lands in Phase 4.
 */
export function getStoredUserName(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredUserName(name: string): void {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Username cannot be empty");
  }
  localStorage.setItem(STORAGE_KEY, trimmed);
}

export function hasStoredUserName(): boolean {
  return getStoredUserName() !== null;
}
