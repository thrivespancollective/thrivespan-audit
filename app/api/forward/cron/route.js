// Daily (vercel.json). Week 10 → "book the slow set". Week 12 → "capture day".
// Each reminder fires once per capture, keyed on the capture it counts from.
import { listMemberEmails, getMember, saveMember, getEntries } from "../../../../lib/forward/store.js";
import { lastFastCapture, lastMove, lastSetup } from "../../../../lib/forward/fields.js";
import { sendBookSlowSet, sendCaptureDay } from "../../../../lib/forward/email.js";
import { sameSecret } from "../../../../lib/forward/auth.js";
import { storeConfigured } from "../../../../lib/forward/store.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DAY = 24 * 60 * 60 * 1000;

export async function GET(request) {
  const auth = (request.headers.get("authorization") || "").replace(/^Bearer /, "");
  if (!sameSecret(auth, "CRON_SECRET")) return new Response("Unauthorized", { status: 401 });
  if (!storeConfigured()) return Response.json({ ok: false, error: "store not configured" }, { status: 503 });

  const sent = { book: 0, capture: 0 };
  for (const email of await listMemberEmails()) {
    const member = await getMember(email);
    if (!member) continue;
    const entries = await getEntries(email);
    const anchor = lastFastCapture(entries);
    if (!anchor) continue;
    const days = (Date.now() - new Date(anchor.at).getTime()) / DAY;
    const reminders = member.reminders || {};
    const move = lastMove(entries)?.move;

    if (days >= 84 && reminders.capture !== anchor.id) {
      const r = await sendCaptureDay({ to: email, name: member.name, move, setup: lastSetup(entries) });
      if (r.ok) {
        reminders.capture = anchor.id;
        sent.capture++;
      }
    } else if (days >= 70 && days < 84 && reminders.book !== anchor.id) {
      const r = await sendBookSlowSet({ to: email, name: member.name, move });
      if (r.ok) {
        reminders.book = anchor.id;
        sent.book++;
      }
    }
    await saveMember({ ...member, reminders });
  }
  console.log("[forward-cron]", sent);
  return Response.json({ ok: true, sent });
}
