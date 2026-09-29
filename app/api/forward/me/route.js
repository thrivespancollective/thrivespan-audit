// Her record: read it, or append a capture. Never edits a past capture.
import { notReady } from "../_guard.js";
import { readToken } from "../../../../lib/forward/auth.js";
import { getMember, saveMember, getEntries, appendEntry } from "../../../../lib/forward/store.js";
import { cleanEntry } from "../../../../lib/forward/fields.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const signedOut = () =>
  Response.json({ ok: false, error: "Sign in again to see your numbers." }, { status: 401 });

export async function GET(request) {
  const blocked = notReady();
  if (blocked) return blocked;
  const email = readToken(request);
  if (!email) return signedOut();
  const member = await getMember(email);
  if (!member) return signedOut();
  const entries = await getEntries(email);
  return Response.json({ ok: true, member: { name: member.name, email: member.email }, entries });
}

export async function POST(request) {
  const blocked = notReady();
  if (blocked) return blocked;
  const email = readToken(request);
  if (!email) return signedOut();
  const member = await getMember(email);
  if (!member) return signedOut();

  const body = (await request.json().catch(() => ({}))) || {};
  if (body.name && !member.name) {
    await saveMember({ ...member, name: String(body.name).trim().slice(0, 60) });
  }
  const values = cleanEntry(body.values);
  if (!Object.keys(values).length) {
    return Response.json({ ok: false, error: "Add at least one number or note, then save." }, { status: 400 });
  }
  const entry = await appendEntry(email, values);
  return Response.json({ ok: true, entry });
}
