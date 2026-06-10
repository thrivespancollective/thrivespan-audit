// Circle Admin API v2 client.
//
// The community token is an Admin API v2 token (Bearer auth). The legacy v1 API
// (/api/v1/*) rejects it with a 200 body of {"status":"unauthorized"} — that
// silent non-error is what kept tags from ever sticking. Everything here targets
// /api/admin/v2/* with Bearer.
//
// One-call flow: resolve tag names -> ids from GET /member_tags, then POST
// /community_members with member_tag_ids to create the audience member and apply
// every tag atomically. skip_invitation=true so Circle doesn't send its own
// community welcome (we run our own nurture sequence).

const V2 = "https://app.circle.so/api/admin/v2";

// name(lowercased) -> tag id. Cached for the life of a warm serverless instance.
let _tagMapCache = null;

function authHeaders(token) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

// Fetch all member tags and build a name->id map. Paginates defensively.
export async function getTagMap(token, { force = false } = {}) {
  if (_tagMapCache && !force) return _tagMapCache;
  const map = new Map();
  let page = 1;
  for (;;) {
    const res = await fetch(`${V2}/member_tags?per_page=100&page=${page}`, {
      headers: authHeaders(token),
    });
    if (!res.ok) {
      throw new Error(`member_tags list failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    const records = Array.isArray(data) ? data : data.records || [];
    for (const t of records) map.set(String(t.name).toLowerCase(), t.id);
    if (Array.isArray(data) || !data.has_next_page || records.length === 0) break;
    page += 1;
  }
  _tagMapCache = map;
  return map;
}

// Split requested tag names into resolved ids + names with no Circle tag yet.
export function resolveTagIds(tagMap, tagNames) {
  const ids = [];
  const missing = [];
  for (const name of tagNames) {
    const id = tagMap.get(String(name).toLowerCase());
    if (id) ids.push(id);
    else missing.push(name);
  }
  return { ids, missing };
}

// Create the audience member with tags applied by id in a single call. Returns a
// structured result; never throws on a non-2xx so the caller can soft-fail.
export async function createMemberWithTags(token, { email, name, tagIds }) {
  const res = await fetch(`${V2}/community_members`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      email,
      name,
      member_tag_ids: tagIds,
      skip_invitation: true,
    }),
  });
  const text = await res.text();
  let body = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* leave as text */
  }
  return { ok: res.ok, status: res.status, body };
}

// One call from the route: resolve names->ids, create the tagged member, and
// report exactly which tags applied and which were missing from Circle.
export async function captureLeadWithTags(token, { email, name, tagNames }) {
  const tagMap = await getTagMap(token);
  const { ids, missing } = resolveTagIds(tagMap, tagNames);
  const result = await createMemberWithTags(token, { email, name, tagIds: ids });
  // Circle echoes applied tags back on success — use that as the receipt.
  const appliedFromApi = Array.isArray(result.body?.member_tags)
    ? result.body.member_tags.map((t) => t.name)
    : null;
  return {
    ok: result.ok,
    status: result.status,
    requestedCount: tagNames.length,
    appliedCount: ids.length,
    appliedTags: appliedFromApi,
    missingTags: missing,
    body: result.body,
  };
}
