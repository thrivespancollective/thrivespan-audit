// FSSH2K Forward — storage on Upstash Redis (REST, no SDK).
// Vercel → Storage → "Upstash for Redis" injects KV_REST_API_URL + KV_REST_API_TOKEN.
//
// Keys
//   fwd:members          set of emails
//   fwd:m:<email>        JSON member { email, name, createdAt, reminders: {…} }
//   fwd:e:<email>        list of JSON entries { id, at, values }   ← APPEND ONLY
//   fwd:code:<email>     sign-in code, 15 min TTL
//   fwd:tries:<email>    wrong-code counter, 15 min TTL
//
// 🔑 Append only. A capture is never edited or overwritten — her history IS the
// product. Two rows on different dates is correct: that is how the slow clock gets in.

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export function storeConfigured() {
  return Boolean(URL_ && TOKEN);
}

async function cmd(...args) {
  const res = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(`redis ${args[0]}: ${data.error || res.status}`);
  return data.result;
}

export const normEmail = (e) => String(e || "").trim().toLowerCase();

export async function getMember(email) {
  const raw = await cmd("GET", `fwd:m:${normEmail(email)}`);
  return raw ? JSON.parse(raw) : null;
}

export async function saveMember(member) {
  const email = normEmail(member.email);
  await cmd("SET", `fwd:m:${email}`, JSON.stringify({ ...member, email }));
  await cmd("SADD", "fwd:members", email);
}

export async function getEntries(email) {
  const rows = await cmd("LRANGE", `fwd:e:${normEmail(email)}`, 0, -1);
  return (rows || []).map((r) => JSON.parse(r));
}

export async function appendEntry(email, values) {
  const entry = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    values,
  };
  await cmd("RPUSH", `fwd:e:${normEmail(email)}`, JSON.stringify(entry));
  return entry;
}

export async function listMemberEmails() {
  return (await cmd("SMEMBERS", "fwd:members")) || [];
}

export async function putCode(email, code) {
  const e = normEmail(email);
  await cmd("SET", `fwd:code:${e}`, code, "EX", 900);
  await cmd("DEL", `fwd:tries:${e}`);
}

// Returns true once, then burns the code. Five wrong tries burns it too.
export async function checkCode(email, code) {
  const e = normEmail(email);
  const stored = await cmd("GET", `fwd:code:${e}`);
  if (!stored) return false;
  if (String(code).trim() === stored) {
    await cmd("DEL", `fwd:code:${e}`);
    return true;
  }
  const tries = await cmd("INCR", `fwd:tries:${e}`);
  await cmd("EXPIRE", `fwd:tries:${e}`, 900);
  if (tries >= 5) await cmd("DEL", `fwd:code:${e}`);
  return false;
}

// One code email per address per minute.
export async function takeCooldown(email) {
  const ok = await cmd("SET", `fwd:cool:${normEmail(email)}`, "1", "NX", "EX", 60);
  return ok === "OK";
}

// Named groups (e.g. "build") for Measure Weeks that aren't for everyone.
export async function groupMembers(name) {
  return (await cmd("SMEMBERS", `fwd:group:${name}`)) || [];
}

export async function setGroup(name, emails) {
  await cmd("DEL", `fwd:group:${name}`);
  const clean = [...new Set(emails.map(normEmail).filter(Boolean))];
  if (clean.length) await cmd("SADD", `fwd:group:${name}`, ...clean);
  return clean.length;
}
