// Admin: set who is in a named group (e.g. "build"). Header x-forward-key: FORWARD_ADMIN_KEY.
// Body: { "group": "build", "emails": ["a@x.com", ...] } — replaces the group.
import { setGroup, groupMembers, storeConfigured } from "../../../../lib/forward/store.js";
import { sameSecret } from "../../../../lib/forward/auth.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  if (!sameSecret(request.headers.get("x-forward-key"), "FORWARD_ADMIN_KEY")) return new Response("Unauthorized", { status: 401 });
  if (!storeConfigured()) return Response.json({ ok: false, error: "store not configured" }, { status: 503 });
  const { group, emails } = (await request.json().catch(() => ({}))) || {};
  if (!/^[a-z0-9-]{1,30}$/.test(group || "") || !Array.isArray(emails)) {
    return Response.json({ ok: false, error: "Send { group, emails: [] }" }, { status: 400 });
  }
  const count = await setGroup(group, emails);
  return Response.json({ ok: true, group, count, members: await groupMembers(group) });
}
