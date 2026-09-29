// Daily (vercel.json). Shared Measure Weeks — see lib/forward/schedule.js.
// Each email goes once per woman per Measure Week. Nobody chases by hand.
import { listMemberEmails, getMember, saveMember, getEntries, groupMembers, storeConfigured } from "../../../../lib/forward/store.js";
import { lastPicks, lastSetup } from "../../../../lib/forward/fields.js";
import { sendBookLabs, sendCaptureDay } from "../../../../lib/forward/email.js";
import { sameSecret } from "../../../../lib/forward/auth.js";
import { dueToday } from "../../../../lib/forward/schedule.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  const auth = (request.headers.get("authorization") || "").replace(/^Bearer /, "");
  if (!sameSecret(auth, "CRON_SECRET")) return new Response("Unauthorized", { status: 401 });
  if (!storeConfigured()) return Response.json({ ok: false, error: "store not configured" }, { status: 503 });

  const due = dueToday();
  const sent = { book: 0, capture: 0 };
  if (!due.length) return Response.json({ ok: true, due: [], sent });

  const everyone = await listMemberEmails();
  for (const { week, kind } of due) {
    const recipients = week.who === "all" ? everyone : await groupMembers(week.who);
    for (const email of recipients) {
      const member = await getMember(email);
      if (!member) continue;
      const key = `${week.id}:${kind}`;
      const reminders = member.reminders || {};
      if (reminders[key]) continue;
      const entries = await getEntries(email);
      const play = lastPicks(entries).play?.value;
      const r =
        kind === "book"
          ? await sendBookLabs({ to: email, name: member.name, play })
          : await sendCaptureDay({ to: email, name: member.name, play, setup: lastSetup(entries) });
      if (r.ok) {
        await saveMember({ ...member, reminders: { ...reminders, [key]: new Date().toISOString() } });
        sent[kind]++;
      }
    }
  }
  console.log("[forward-cron]", due.map((d) => `${d.week.id}:${d.kind}`), sent);
  return Response.json({ ok: true, due: due.map((d) => `${d.week.id}:${d.kind}`), sent });
}
