// API route — receives audit submission, posts to Circle (contact + tags),
// and fires the transactional welcome email via Resend.
// Both integrations soft-fail so the audit experience never breaks on infra issues.

import { buildWelcomeEmail } from "../../../lib/welcome-email.js";
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
  const audienceId = process.env.RESEND_AUDIENCE_ID || "9a610e1c-0db5-417c-91c3-7fba92775b8d";
  if (!resendKey || !audienceId) {
    console.log("[nurture-enroll] RESEND_API_KEY or RESEND_AUDIENCE_ID not set — skipping nurture enrollment");
    return { enrolled: false, reason: "resend-audience-not-configured" };
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

    // Fire the `contact.created` event — THIS is what triggers the Resend
    // post-Code nurture Automation. (Adding a contact alone does NOT trigger it;
    // automations fire on sent events.) FIRST_NAME auto-resolves from the contact
    // we just created, so no payload is needed. Soft-fails.
    try {
      await fetch("https://api.resend.com/events/send", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ event: "contact.created", email }),
      });
      console.log("[nurture-event] contact.created fired", { email });
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

// Builds a starter DM from the Code result — Juls tweaks + sends. For a sharper,
// fully voice-gated version she runs /audit-dm with the same result.
function buildDmDraft({ firstName, scoreResult, arcStage }) {
  const anchor = cap(scoreResult?.anchor);
  const lever = cap(scoreResult?.edge); // "edge" is the internal field name for the Lever pillar
  const arcLine = {
    "wake-up": "You're right at the start of seeing the pattern.",
    reset: "You're in a Reset — not starting over, resetting with the right structure this time.",
    assembly: "You're in the Assembly stage — the pieces are there, they just haven't come together yet.",
    command: "You're already running it — now it's about precision.",
  }[String(arcStage || "").toLowerCase()] || "";
  return [
    `${firstName} — your Code came back with ${anchor} as your Anchor: the one you can count on, and already your strength.`,
    `Your Lever is ${lever} — the one with the most room, where your effort pays off fastest. Not a weak spot; your biggest opportunity.`,
    arcLine,
    `Create Your Realm is the cleanest first step — a 4-hour build to design the conditions so it's intentional, not left to chance. Want me to send you the link?`,
  ].filter(Boolean).join("\n\n");
}

// 🔔 DM Beat A — emails Juls the moment a Code is completed, with the result +
// a ready-to-send DM draft. Soft-fails so it never breaks the audit.
async function notifyJulsToDM({ firstName, email, scoreResult, arcStage, route, tags }) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log("[notify-juls] RESEND_API_KEY not set — skipping DM ping");
    return { sent: false, reason: "resend-not-configured" };
  }
  const from = process.env.RESEND_FROM || DEFAULT_FROM;
  const draft = buildDmDraft({ firstName, scoreResult, arcStage });
  const subject = `🔔 New Code: ${firstName} — send the DM (route: ${route || "n/a"})`;
  const text = [
    `${firstName} just completed the Queenager Code. Send them DM Beat A.`,
    ``,
    `Find them: ${email}   (search LinkedIn / Circle)`,
    `Anchor: ${scoreResult?.anchor ?? "?"}  ·  Lever: ${scoreResult?.edge ?? "?"}  ·  Arc: ${arcStage ?? "?"}  ·  Route: ${route ?? "?"}  ·  Score: ${scoreResult?.composite ?? "?"}`,
    `Tags: ${(tags || []).join(", ")}`,
    ``,
    `--- DRAFT DM (tweak + send) ---`,
    draft,
    ``,
    `(For a sharper, voice-gated version, run /audit-dm with the result above.)`,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [NOTIFY_TO], subject, text }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn("[notify-juls-error]", res.status, errText);
      return { sent: false, status: res.status, reason: "notify-error" };
    }
    const data = await res.json();
    console.log("[notify-juls] sent", { to: NOTIFY_TO, id: data.id });
    return { sent: true, id: data.id };
  } catch (err) {
    console.error("[notify-juls-failure]", err);
    return { sent: false, reason: "notify-network-error" };
  }
}
