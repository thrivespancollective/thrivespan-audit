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

  // Tag schema — Circle uses these for nurture-automation segmentation.
  // Built in lib/tags.js (shared with scripts/circle-probe.mjs).
  const tags = buildAuditTags({ arcStage, scoreResult, metaAnswers, route });

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
