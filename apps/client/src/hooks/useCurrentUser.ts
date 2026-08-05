import { useCallback, useState } from "react";
import { getStoredUserName, setStoredUserName } from "@/lib/username";

/**
 * Thin reactive wrapper around lib/username.ts's localStorage functions.
 * Components that just need to READ the name (e.g. Navbar) could call
 * getStoredUserName() directly, but anything that needs to re-render when
 * the name is SET (the name-gate flow) needs this in React state.
 */
export function useCurrentUser() {
  const [name, setName] = useState<string | null>(() => getStoredUserName());

  const setUserName = useCallback((newName: string) => {
    setStoredUserName(newName);
    setName(newName);
  }, []);

  return { name, setUserName };
}
