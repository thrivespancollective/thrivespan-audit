// Circle v1 Admin API helper.
//
// Why v1 (not v2): tag ASSIGNMENT only exists on the v1 API. The v2
// `community_members` create endpoint silently ignores `tag_list`, and v2 has
// no documented member-tag-assignment endpoint (confirmed against Circle's own
// docs + v1 Postman collection, 2026-06-09). That silent no-op is the bug this
// file fixes.
//
// Two facts the v1 contract forces on us:
//   1. Auth scheme is `Authorization: Token <token>` — NOT `Bearer`.
//   2. Tags are applied by numeric ID, so we resolve name→id from /member_tags
//      before creating the contact. Tags must already exist in Circle (there is
//      no tag-create endpoint in v1 — create the taxonomy once in the UI).

const V1 = "https://app.circle.so/api/v1";

// name(lowercased) -> tag id. Cached for the life of a warm serverless instance
// so we don't re-list tags on every submission.
let _tagMapCache = null;

function authHeaders(token) {
  return { Authorization: `Token ${token}`, "Content-Type": "application/json" };
}

// Fetch all member tags and build a name→id map. Paginates defensively.
export async function getTagMap(token, communityId, { force = false } = {}) {
  if (_tagMapCache && !force) return _tagMapCache;
  const map = new Map();
  let page = 1;
  for (;;) {
    // No community_id — the endpoint is token-scoped (same as /contacts). Passing
    // a stale CIRCLE_COMMUNITY_ID here returned an empty list.
    const res = await fetch(`${V1}/member_tags?per_page=100&page=${page}`, {
      headers: authHeaders(token),
    });
    if (!res.ok) {
      throw new Error(`member_tags list failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    // v1 returns either a bare array or a paginated { records, has_next_page }.
    const records = Array.isArray(data) ? data : data.records || [];
    for (const t of records) map.set(String(t.name).toLowerCase(), t.id);
    const hasNext = !Array.isArray(data) && data.has_next_page;
    if (!hasNext || records.length === 0) break;
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

// Create/upsert an audience contact (community_lead) with tags applied by id in
// a single call. Returns a structured result; never throws on a non-2xx so the
// caller can soft-fail without breaking the audit experience.
export async function upsertContactWithTags(token, { email, name, tagIds }) {
  const res = await fetch(`${V1}/contacts`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      email,
      name,
      contact_type: "community_lead",
      member_tag_ids: tagIds,
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

// One call from the route: resolve names→ids, create the tagged lead, and
// report exactly which tags applied and which were missing from Circle.
export async function captureLeadWithTags(token, communityId, { email, name, tagNames }) {
  // TEMP DEBUG: raw member_tags probe to diagnose the empty tag map.
  let rawTagProbe;
  try {
    const p = await fetch(`${V1}/member_tags?per_page=5`, { headers: authHeaders(token) });
    rawTagProbe = { status: p.status, sample: (await p.text()).slice(0, 400) };
  } catch (e) {
    rawTagProbe = { error: String(e) };
  }

  const tagMap = await getTagMap(token, communityId);
  const { ids, missing } = resolveTagIds(tagMap, tagNames);
  const result = await upsertContactWithTags(token, { email, name, tagIds: ids });
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
    tagMapSize: tagMap.size,
    rawTagProbe,
    body: result.body,
  };
}
