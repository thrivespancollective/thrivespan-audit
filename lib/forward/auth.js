// FSSH2K Forward — sign-in tokens.
// She proves her email once with a 6-digit code; the page keeps a signed token
// on her phone for 180 days so she is remembered next time.
import crypto from "node:crypto";
import { normEmail } from "./store.js";

const SECRET = process.env.FORWARD_SECRET;
const TTL_MS = 180 * 24 * 60 * 60 * 1000;

const b64 = (s) => Buffer.from(s).toString("base64url");
const sign = (s) => crypto.createHmac("sha256", SECRET).update(s).digest("base64url");

export function authConfigured() {
  return Boolean(SECRET && SECRET.length >= 32);
}

export function newCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

export function issueToken(email) {
  const body = b64(JSON.stringify({ e: normEmail(email), x: Date.now() + TTL_MS }));
  return `${body}.${sign(body)}`;
}

// → email, or null
export function readToken(request) {
  const h = request.headers.get("authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  const [body, sig] = token.split(".");
  if (!body || !sig || !SECRET) return null;
  const expected = sign(body);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const { e, x } = JSON.parse(Buffer.from(body, "base64url").toString());
    return x > Date.now() ? e : null;
  } catch {
    return null;
  }
}

export function sameSecret(given, envName) {
  const want = process.env[envName];
  if (!want || !given) return false;
  const a = Buffer.from(String(given));
  const b = Buffer.from(want);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Stable, non-reversible id for de-identified exports.
export function anonId(email) {
  return crypto.createHmac("sha256", SECRET || "fwd").update(normEmail(email)).digest("hex").slice(0, 10);
}
