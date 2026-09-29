// The CX analyst's feed. Header x-forward-key: FORWARD_ADMIN_KEY.
// Default is DE-IDENTIFIED (stable anon id, no name, no email, no free text).
// ?full=1 adds name, email and notes — for congratulating her by name, never for publishing.
// ⛔ Numbers are not cleared for publishing per person. Aggregate only, and only once
//    there are enough women that no one is identifiable.
import { listMemberEmails, getMember, getEntries } from "../../../../lib/forward/store.js";
import { sameSecret, anonId } from "../../../../lib/forward/auth.js";
import { storeConfigured } from "../../../../lib/forward/store.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FREE_TEXT = ["move", "notes"];

export async function GET(request) {
  if (!sameSecret(request.headers.get("x-forward-key"), "FORWARD_ADMIN_KEY")) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!storeConfigured()) return Response.json({ ok: false, error: "store not configured" }, { status: 503 });
  const full = new URL(request.url).searchParams.get("full") === "1";

  const members = [];
  for (const email of await listMemberEmails()) {
    const member = await getMember(email);
    const entries = await getEntries(email);
    members.push({
      id: anonId(email),
      ...(full ? { name: member?.name || "", email } : {}),
      joinedAt: member?.createdAt,
      entries: entries.map((e) => ({
        at: e.at,
        values: full
          ? e.values
          : Object.fromEntries(Object.entries(e.values).filter(([k]) => !FREE_TEXT.includes(k))),
      })),
    });
  }
  return Response.json({ ok: true, exportedAt: new Date().toISOString(), deidentified: !full, members });
}
