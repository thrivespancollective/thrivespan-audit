// API route — receives audit submission, posts to Circle (contact + tags),
// and fires the transactional welcome email via Resend.
// Both integrations soft-fail so the audit experience never breaks on infra issues.

import { buildWelcomeEmail } from "../../../lib/welcome-email.js";

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
  // Brand-locked term: "lever" not "edge" (internal scoring code still uses
  // `edge` for backward compat; user-facing tags use `lever-`).
  const cascadeTrigger = metaAnswers?.meta_edge || "not-sure";
  const tags = [
    "source-queenager-code",
    "audit-taken",
    `arc-${arcStage || "unknown"}`,
    `anchor-${scoreResult?.anchor || "unknown"}`,
    `lever-${scoreResult?.edge || "unknown"}`,
    `cascade-${cascadeTrigger}`,
    `combo-${scoreResult?.anchor || "unk"}-${scoreResult?.edge || "unk"}`,
    `composite-${compositeBand(scoreResult?.composite)}`,
    `route-${route || "unknown"}`,
  ].filter(Boolean);

  // Always log for debugging — visible in Vercel logs
  console.log("[audit-submit]", {
    firstName,
    email,
    arcStage,
    composite: scoreResult?.composite,
    anchor: scoreResult?.anchor,
    edge: scoreResult?.edge,
    cascadeTrigger,
    route,
    tags,
  });

  // Try to post to Circle if configured
  const circleToken = process.env.CIRCLE_API_TOKEN;
  const circleCommunityId = process.env.CIRCLE_COMMUNITY_ID;

  if (!circleToken || !circleCommunityId) {
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
    // Circle Admin v2 API — creates or upserts a community member with tags.
    // skip_invitation=true: contact is created + tagged but doesn't receive
    // the auto Circle-community welcome email (we run our own nurture sequence).
    const circleRes = await fetch(
      `https://app.circle.so/api/admin/v2/community_members`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${circleToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name: firstName,
          tag_list: tags,
          skip_invitation: true,
        }),
      }
    );

    if (!circleRes.ok) {
      const errText = await circleRes.text();
      console.warn("[circle-api-error]", circleRes.status, errText);
      // Don't fail the user experience — still fire the welcome email
      const emailResult = await sendWelcomeEmail({
        firstName, email, scoreResult, route, metaAnswers, arcStage,
      });
      return Response.json({
        ok: true,
        mode: "circle-error-soft-fail",
        circleStatus: circleRes.status,
        tags,
        email: emailResult,
      });
    }

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

function compositeBand(composite) {
  if (composite == null) return "unknown";
  if (composite >= 70) return "70-80";
  if (composite >= 55) return "55-69";
  if (composite >= 40) return "40-54";
  return "20-39";
}
