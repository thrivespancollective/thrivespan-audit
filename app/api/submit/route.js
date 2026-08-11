// API route — receives audit submission, posts to Circle (contact + tags),
// and fires the transactional welcome email via Resend.
// Both integrations soft-fail so the audit experience never breaks on infra issues.

import { buildWelcomeEmail } from "../../../lib/welcome-email.js";
import { BLOCKER_COPY } from "../../../lib/blockers.js";
import { buildAuditTags } from "../../../lib/tags.js";
import { captureLeadWithTags } from "../../../lib/circle.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Where the welcome email is sent FROM. Domain verified in Resend 2026-06-06.
// Override via RESEND_FROM env var if a different sender is needed.
const DEFAULT_FROM = "Juli <team@thrivespancollective.com>";

// Where the "send the DM" pings go (DM Beat A). Override via JULS_NOTIFY_EMAIL.
const NOTIFY_TO = process.env.JULS_NOTIFY_EMAIL || "team@thrivespancollective.com";

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const {
    firstName,
    email,
    answers,
    arcStage,
    metaAnswers,
    metaEdgeOther,
    modernToolsNote,
    scoreResult,
    route,
    testMode,
  } = payload || {};

  // Test submissions never touch Circle or the list — just acknowledge.
  if (testMode) {
    console.log("[audit-submit TEST]", {
      composite: scoreResult?.composite,
      anchor: scoreResult?.anchor,
      edge: scoreResult?.edge,
      route,
    });
    return Response.json({ ok: true, mode: "test-skip-circle" });
  }

  if (!email || !firstName) {
    return Response.json(
      { ok: false, error: "Name and email required" },
      { status: 400 }
    );
  }

  // Enroll in the Resend nurture Audience — this fires the post-Code Automation
  // (the Day 2/4/7/10/14 sequence). Independent of Circle + the welcome email;
  // soft-fails so the audit experience never breaks. Test subs already returned.
  await addToResendAudience({ firstName, email });

  // Tag schema — Circle uses these for nurture-automation segmentation.
  // Built in lib/tags.js (shared with scripts/circle-probe.mjs).
  const tags = buildAuditTags({ arcStage, scoreResult, metaAnswers, route });

  // 🔔 DM Beat A — ping Juls to send the Day-0 result DM. Soft-fails (logs only).
  await notifyJulsToDM({ firstName, email, scoreResult, arcStage, route, tags });
  // 🔔 Schedule the Beat-B nudge to Juls for +14 days (after the nurture). Soft-fails.
  await scheduleBeatBNotify({ firstName, email, scoreResult, arcStage });

  // Always log for debugging — visible in Vercel logs
  console.log("[audit-submit]", {
    firstName,
    email,
    arcStage,
    composite: scoreResult?.composite,
    anchor: scoreResult?.anchor,
    edge: scoreResult?.edge,
    route,
    tags,
  });

  // Try to post to Circle if configured (v2 Admin API is token-scoped).
  const circleToken = process.env.CIRCLE_API_TOKEN;

  if (!circleToken) {
    // Circle not wired — still fire the welcome email
    const emailResult = await sendWelcomeEmail({
      firstName, email, scoreResult, route, metaAnswers, arcStage,
    });
    return Response.json({
      ok: true,
      mode: "log-only",
      note: "Circle API not configured. Submission logged.",
      tags,
      email: emailResult,
    });
  }

  try {
    // Circle v1 Admin API — create the audience lead and apply tags by ID in a
    // single call. v1 (not v2) because tag assignment only exists on v1; the v2
    // create endpoint silently ignores tags. See lib/circle.js.
    const circle = await captureLeadWithTags(circleToken, {
      email,
      name: firstName,
      tagNames: tags,
    });

    if (circle.missingTags.length) {
      // Tags requested that don't exist in Circle yet — create them in the UI.
      console.warn("[circle-tags-missing]", circle.missingTags);
    }

    if (!circle.ok) {
      console.warn("[circle-api-error]", circle.status, circle.body);
      // Don't fail the user experience — still fire the welcome email
      const emailResult = await sendWelcomeEmail({
        firstName, email, scoreResult, route, metaAnswers, arcStage,
      });
      return Response.json({
        ok: true,
        mode: "circle-error-soft-fail",
        circleStatus: circle.status,
        tags,
        missingTags: circle.missingTags,
        email: emailResult,
      });
    }

    console.log("[circle-ok]", {
      email,
      applied: circle.appliedTags ?? circle.appliedCount,
      missing: circle.missingTags,
    });

    // Circle leg done. Now fire the welcome email (independent — soft-fails too).
    const emailResult = await sendWelcomeEmail({
      firstName,
      email,
      scoreResult,
      route,
      metaAnswers,
      arcStage,
    });

    return Response.json({
      ok: true,
      mode: "circle-ok",
      tags,
      appliedTags: circle.appliedTags,
      missingTags: circle.missingTags,
      email: emailResult,
    });
  } catch (err) {
    console.error("[circle-fetch-failure]", err);
    // Still try to send the welcome email even if Circle errored
    const emailResult = await sendWelcomeEmail({
      firstName,
      email,
      scoreResult,
      route,
      metaAnswers,
      arcStage,
    });
    return Response.json({
      ok: true,
      mode: "circle-network-soft-fail",
      tags,
      email: emailResult,
    });
  }
}

async function sendWelcomeEmail({ firstName, email, scoreResult, route, metaAnswers, arcStage }) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log("[welcome-email] RESEND_API_KEY not set — skipping email send");
    return { sent: false, reason: "resend-not-configured" };
  }

  const fromAddress = process.env.RESEND_FROM || DEFAULT_FROM;
  const { subject, text, html } = buildWelcomeEmail({
    firstName,
    scoreResult,
    route,
    metaAnswers,
    arcStage,
  });

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject,
        text,
        html,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn("[resend-api-error]", res.status, errText);
      return { sent: false, status: res.status, reason: "resend-error" };
    }
    const data = await res.json();
    console.log("[welcome-email] sent", { email, id: data.id });
    return { sent: true, id: data.id };
  } catch (err) {
    console.error("[resend-fetch-failure]", err);
    return { sent: false, reason: "resend-network-error" };
  }
}

// Adds the Code-taker to the Resend Audience that the post-Code nurture
// Automation triggers on. Soft-fails (logs, never throws) so a Resend hiccup
// never breaks the audit. Needs RESEND_API_KEY + RESEND_AUDIENCE_ID.
async function addToResendAudience({ firstName, email }) {
  const resendKey = process.env.RESEND_API_KEY;
  // Resend "General" audience (the Free-plan default — the post-Code nurture
  // Automation triggers on it). Hardcoded default so no Vercel env step is
  // needed; override via RESEND_AUDIENCE_ID if the audience ever changes.
  // 🔴 HARDCODED DEFAULT REMOVED 2026-08-07.
  //
  // The old default was the Resend "General" audience — the one the RETIRED
  // post-Queenager-Code Automation triggers on. Because it was hardcoded,
  // every "It's Not Discipline" completer was silently enrolled in the old
  // nurture and received five emails of retired, Queenager-era copy. Caught
  // by Juls's own test submission, 2026-08-07.
  //
  // Enrollment is now OPT-IN: no RESEND_AUDIENCE_ID env var set = no
  // enrollment. Set it in Vercel to the NEW audience once the
  // "It's Not Discipline" nurture is built (see
  // Helios → Nurture/ItsNotDiscipline_After_Nurture.md).
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!resendKey || !audienceId) {
    console.log("[nurture-enroll] RESEND_AUDIENCE_ID not set — nurture enrollment intentionally OFF");
    return { enrolled: false, reason: "nurture-audience-not-configured" };
  }

  try {
    const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        first_name: firstName,
        unsubscribed: false,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn("[resend-audience-error]", res.status, errText);
      return { enrolled: false, status: res.status, reason: "resend-audience-error" };
    }
    const data = await res.json();
    console.log("[nurture-enroll] added to audience", { email, id: data.id });

    // Fire the trigger event. Adding a contact alone does NOT start an
    // Automation — automations fire on sent events. FIRST_NAME auto-resolves
    // from the contact we just created, so no payload is needed. Soft-fails.
    //
    // 🔴 CHANGED 2026-08-11: `contact.created` → `discipline.completed`.
    //
    // `contact.created` is a GENERIC event — every automation listening for it
    // fires for every contact added, from any source. The retired "Queenager
    // Code — Post-Code Nurture" automation listened on exactly that, which is
    // how ten completers received retired Queenager-era copy. Disabling that
    // automation fixes today; a generic trigger would break again the first
    // time a warm contact is added by hand and receives the assessment nurture.
    //
    // A dedicated event makes enrollment and triggering independent. This is
    // the pattern the working nurtures already use — Post-Realm-Code fires on
    // `realm.completed`, Warm Re-Intro on `warm.added`. One lead magnet, one
    // event, one automation.
    //
    // ⚠️ The Resend automation for "It's Not Discipline" MUST be triggered on
    // `discipline.completed`. See Helios →
    // Nurture/ItsNotDiscipline_After_Nurture.md § THE BUILD SHEET.
    const NURTURE_EVENT = "discipline.completed";
    try {
      await fetch("https://api.resend.com/events/send", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ event: NURTURE_EVENT, email }),
      });
      console.log("[nurture-event] fired", { event: NURTURE_EVENT, email });
    } catch (e) {
      console.error("[nurture-event-failure]", e);
    }

    return { enrolled: true, id: data.id };
  } catch (err) {
    console.error("[resend-audience-fetch-failure]", err);
    return { enrolled: false, reason: "resend-audience-network-error" };
  }
}

// Capitalizes a pillar/route label for the draft DM ("connect" → "Connect").
function cap(s) {
  if (!s || typeof s !== "string") return s || "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
// Builds the DM Juls actually sends — her name, her blocker, her move, and a
// draft in TeamQueen voice. She tweaks two words and sends it.
//
// Rebuilt 2026-08-05: the old version drafted a Queenager Code DM about
// Anchors, Levers and Create Your Realm — none of which exist any more.
function buildDmDraft({ firstName, scoreResult }) {
  const blocker = scoreResult?.blocker || "unguarded";
  const copy = BLOCKER_COPY[blocker] || BLOCKER_COPY.unguarded;

  // One human line per blocker, so it doesn't read like a template.
  const openers = {
    unguarded: `you came back Unguarded — nothing on your calendar is actually yours, so the hour goes to whoever asks first.`,
    unwitnessed: `you came back Unwitnessed — you'll move a mountain for someone who's counting on you, and nobody's counting on you for this.`,
    tabs: `you came back with too many tabs open — you know what to do, you just can't get past deciding which one.`,
    overdrawn: `you came back Overdrawn — everyone else gets paid out of your account before you do.`,
  };

  return [
    `${firstName} — ${openers[blocker]}`,
    `Your one move this week: ${copy.move}`,
    `How'd it land? Genuinely asking — I read every reply.`,
  ].join("\n\n");
}

// 🔔 THE DAY-3 PERSONAL NOTE — the beat that replaced four-way automated
// branching. A human referencing her actual result beats any branch, and it
// needs no tags to work.
//
// Scheduled +3 days (not immediate) so it lands after the Day-0 result email
// and after she's had a few days to try the move — which is what makes
// "how'd it land?" a real question instead of a pretext.
//
// Goes to JULS, never the contact. Soft-fails so it can never break a submit.
// ⚠️ Doesn't scale — set a rule for who gets one before the list passes ~100.
async function notifyJulsToDM({ firstName, email, scoreResult, tags }) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log("[notify-juls] RESEND_API_KEY not set — skipping day-3 ping");
    return { sent: false, reason: "resend-not-configured" };
  }
  const from = process.env.RESEND_FROM || DEFAULT_FROM;
  const blocker = scoreResult?.blocker || "unknown";
  const copy = BLOCKER_COPY[blocker];
  const draft = buildDmDraft({ firstName, scoreResult });
  const sendAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const subject = `🔔 Day 3 — send ${firstName} a note (${copy?.name || blocker})`;
  const text = [
    `${firstName} took It's Not Discipline three days ago. Time for the personal note.`,
    ``,
    `Reach her: ${email}`,
    `Her blocker: ${copy?.name || blocker}`,
    `Her move: ${copy?.move || "—"}`,
    `Confidence: ${scoreResult?.confidence || "?"}   Tags: ${(tags || []).join(", ")}`,
    ``,
    `--- DRAFT (tweak + send) ---`,
    draft,
    ``,
    `Keep it short. The whole point is that it's from a person.`,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [NOTIFY_TO], subject, text, scheduled_at: sendAt }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn("[notify-juls-error]", res.status, errText);
      return { sent: false, status: res.status, reason: "notify-error" };
    }
    const data = await res.json();
    console.log("[notify-juls] day-3 scheduled", { to: NOTIFY_TO, at: sendAt, id: data.id });
    return { sent: true, id: data.id, at: sendAt };
  } catch (err) {
    console.error("[notify-juls-failure]", err);
    return { sent: false, reason: "notify-network-error" };
  }
}

// RETIRED 2026-08-05 — Beat B was a +14-day "send your 2nd DM" ping built for
// the Queenager Code's 5-email nurture. The new 18-day sequence ends on an
// automated Round Table invitation, not a second manual DM. The single human
// touch now lives at day 3 (above), where it converts better and costs less.
// Left as a no-op rather than deleted so the call site stays obvious.
async function scheduleBeatBNotify() {
  return { scheduled: false, reason: "retired-2026-08-05" };
}
