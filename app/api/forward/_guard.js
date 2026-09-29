// Shared checks for the FSSH2K Forward routes.
import { storeConfigured } from "../../../lib/forward/store.js";
import { authConfigured } from "../../../lib/forward/auth.js";

export function notReady() {
  if (storeConfigured() && authConfigured()) return null;
  console.warn("[forward] not configured", { store: storeConfigured(), auth: authConfigured() });
  return Response.json(
    { ok: false, error: "FSSH2K Forward isn't switched on yet. Try again soon." },
    { status: 503 }
  );
}

export const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || "").trim());
