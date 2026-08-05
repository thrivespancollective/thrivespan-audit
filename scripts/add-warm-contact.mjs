// scripts/add-warm-contact.mjs
// Adds a person to the Resend audience + fires warm.added → enrolls them
// in the Warm Re-Intro Nurture automation (5-email, 27-day sequence).
//
// Also sends a Start DM reminder directly to team@ (Juls) so she can send
// the personal Day-0 DM. Engager DM (~Day 15) is manual — Juls sends it herself
// to openers/clickers using the approved text in Nurture_WarmReintro_Sequence.md.
//
// Usage:
//   source ~/.claude/thrivespan.env && \
//   /Applications/Codex.app/Contents/Resources/node scripts/add-warm-contact.mjs "First Last" "email@example.com"
//
// Architecture mirrors addToResendAudience() in app/api/submit/route.js.
// Trigger event: warm.added (NOT contact.created — separate namespace, no collision
// with the post-Code nurture which triggers on contact.created).

const RESEND_KEY = process.env.RESEND_API_KEY;
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || "9a610e1c-0db5-417c-91c3-7fba92775b8d";
const EVENT_NAME = "warm.added";
const FROM = "Juli <team@thrivespancollective.com>";
const NOTIFY_TO = "team@thrivespancollective.com";

if (!RESEND_KEY) {
  console.error("RESEND_API_KEY not set. Run: source ~/.claude/thrivespan.env");
  process.exit(1);
}

const [fullName, email] = process.argv.slice(2);

if (!fullName || !email) {
  console.error('Usage: node scripts/add-warm-contact.mjs "First Last" "email@example.com"');
  process.exit(1);
}

const firstName = fullName.split(" ")[0];

async function api(method, path, body) {
  const res = await fetch(`https://api.resend.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
      "User-Agent": "ThriveSpan-Build/1.0",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { ok: res.ok, status: res.status, data: json };
}

async function main() {
  console.log(`Adding warm contact: ${firstName} <${email}>\n`);

  // 1. Add to "General" Resend audience
  const enroll = await api("POST", `/audiences/${AUDIENCE_ID}/contacts`, {
    email,
    first_name: firstName,
    unsubscribed: false,
  });

  if (!enroll.ok) {
    if (enroll.status === 409) {
      console.log("  Contact already in audience — proceeding.");
    } else {
      console.error(`  ❌ Audience add failed (${enroll.status}):`, JSON.stringify(enroll.data));
      process.exit(1);
    }
  } else {
    console.log(`  ✓ Added to Resend audience (id: ${enroll.data.id ?? "ok"})`);
  }

  // 2. Send Start DM reminder to team@ (direct send — not through automation)
  //    Resend automation does not support static to-override, so DM notifications
  //    go out as direct API emails to team@, not as automation steps.
  const dmText = `${firstName} just entered the Warm Re-Intro sequence. Send them the Start DM today.

Find them: ${email}

--- DM to send (personalize + send in your channel — LinkedIn, text, or email) ---

[Name] — I've been thinking about you and wanted to reach out.

Something I'm building is taking up most of my heart right now, and you're someone I want in the room for it.

Will you follow ThriveSpan on Instagram or Facebook? That's where the daily conversation lives, and I want the people I actually care about in it.

Instagram → instagram.com/thrivespancollective
Facebook → facebook.com/thrivespancollective

Here's the short version of what I've been building: ThriveSpan is the women's habit community I wish had existed when my own body changed at 42 and nobody handed me the new playbook. I spent 12 years figuring it out. I built it so Queenagers don't have to do it alone — structured habit work, real science, and a sisterhood that keeps you at it.

You're someone I want in the know. How are you doing?

Love, Juls

---
Engager DM reminder: around Day 15 (${new Date(Date.now() + 15 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}), check if ${firstName} has been opening/clicking.
If yes, send the Engager DM from Nurture_WarmReintro_Sequence.md.`;

  const dmNotify = await api("POST", "/emails", {
    from: FROM,
    to: [NOTIFY_TO],
    subject: `🔔 Warm Intro: ${firstName} (${email}) just entered the sequence — send DM`,
    text: dmText,
  });

  if (!dmNotify.ok) {
    console.warn(`  ⚠ Start DM notification failed (${dmNotify.status}) — continuing anyway`);
  } else {
    console.log(`  ✓ Start DM reminder sent to team@ (id: ${dmNotify.data.id})`);
  }

  // 3. Fire warm.added event — THIS triggers the Resend automation
  const event = await api("POST", "/events/send", {
    event: EVENT_NAME,
    email,
  });

  if (!event.ok) {
    console.error(`  ❌ Event fire failed (${event.status}):`, JSON.stringify(event.data));
    process.exit(1);
  }

  console.log(`  ✓ warm.added event fired`);
  console.log(`\nDone. ${firstName} is now in the Warm Re-Intro Nurture.`);
  console.log(`Beat 1 ("Let me reintroduce myself.") should arrive at ${email} within a few minutes.`);
  console.log(`All 5 beats are now scheduled (Day 0 / 5 / 12 / 20 / 27).`);
  console.log(`\nCheck team@thrivespancollective.com — Start DM reminder sent there.`);
  console.log(`Engager DM (~Day 15): send manually to openers/clickers.`);
}

main().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
