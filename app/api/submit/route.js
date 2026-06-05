// API route — receives audit submission and posts to Circle (when configured).
// Soft-fails so the audit experience never breaks if Circle isn't wired yet.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
    // Not wired yet — record-only, return success
    return Response.json({
      ok: true,
      mode: "log-only",
      note: "Circle API not configured. Submission logged.",
      tags,
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
      // Don't fail the user experience — log and return success
      return Response.json({
        ok: true,
        mode: "circle-error-soft-fail",
        circleStatus: circleRes.status,
        tags,
      });
    }

    return Response.json({ ok: true, mode: "circle-ok", tags });
  } catch (err) {
    console.error("[circle-fetch-failure]", err);
    return Response.json({
      ok: true,
      mode: "circle-network-soft-fail",
      tags,
    });
  }
}

function compositeBand(composite) {
  if (composite == null) return "unknown";
  if (composite >= 70) return "70-80";
  if (composite >= 55) return "55-69";
  if (composite >= 40) return "40-54";
  return "20-39";
}
