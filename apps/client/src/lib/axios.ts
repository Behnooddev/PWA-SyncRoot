import axios from "axios";
import { getStoredUserName } from "@/lib/username";

/**
 * Every request needs the X-User-Name header (see server's currentUser
 * middleware — no auth in V1). Setting it here, once, via an interceptor
 * means individual feature api.ts files never have to remember to attach
 * it themselves.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const userName = getStoredUserName();
  if (userName) {
    config.headers["X-User-Name"] = userName;
  }
  return config;
});
