// Step 2 of sign-in: check the code, create her record the first time, hand back a token.
import { notReady, isEmail } from "../_guard.js";
import { checkCode, getMember, saveMember, normEmail } from "../../../../lib/forward/store.js";
import { issueToken } from "../../../../lib/forward/auth.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  const blocked = notReady();
  if (blocked) return blocked;

  const { email, code, name } = (await request.json().catch(() => ({}))) || {};
  if (!isEmail(email) || !/^\d{6}$/.test(String(code || "").trim())) {
    return Response.json({ ok: false, error: "Enter the 6-digit code from the email." }, { status: 400 });
  }
  if (!(await checkCode(email, code))) {
    return Response.json({ ok: false, error: "That code didn't match. Check the latest email, or send a new code." }, { status: 401 });
  }

  let member = await getMember(email);
  const cleanName = String(name || "").trim().slice(0, 60);
  if (!member) {
    member = { email: normEmail(email), name: cleanName, createdAt: new Date().toISOString(), reminders: {} };
    await saveMember(member);
  } else if (cleanName && !member.name) {
    member = { ...member, name: cleanName };
    await saveMember(member);
  }
  return Response.json({ ok: true, token: issueToken(email), needsName: !member.name });
}
