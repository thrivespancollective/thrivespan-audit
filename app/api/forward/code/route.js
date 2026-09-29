// Step 1 of sign-in: email her a 6-digit code.
import { notReady, isEmail } from "../_guard.js";
import { putCode, takeCooldown } from "../../../../lib/forward/store.js";
import { newCode } from "../../../../lib/forward/auth.js";
import { sendCode } from "../../../../lib/forward/email.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  const blocked = notReady();
  if (blocked) return blocked;

  const { email } = (await request.json().catch(() => ({}))) || {};
  if (!isEmail(email)) {
    return Response.json({ ok: false, error: "Check the email address and try again." }, { status: 400 });
  }
  if (!(await takeCooldown(email))) {
    return Response.json({ ok: true, note: "A code is already on its way. Check your inbox." });
  }
  const code = newCode();
  await putCode(email, code);
  const sent = await sendCode(email.trim(), code);
  if (!sent.ok) {
    return Response.json({ ok: false, error: "The code email didn't go out. Try again in a minute." }, { status: 502 });
  }
  return Response.json({ ok: true });
}
