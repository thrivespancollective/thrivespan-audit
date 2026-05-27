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
    landedLine,
    landedLineOther,
    modernToolsNote,
    scoreResult,
    route,
  } = payload || {};

  if (!email || !firstName) {
    return Response.json(
      { ok: false, error: "Name and email required" },
      { status: 400 }
    );
  }

  // Build tag list — these get attached to the Circle subscriber
  const tags = [
    "source-audit",
    `arc-${arcStage || "unknown"}`,
    `anchor-${scoreResult?.anchor || "unknown"}`,
    `edge-${scoreResult?.edge || "unknown"}`,
    `combo-${scoreResult?.anchor || "unk"}-${scoreResult?.edge || "unk"}`,
    `composite-${compositeBand(scoreResult?.composite)}`,
    `route-${route || "unknown"}`,
    `landed-${landedLine || "unknown"}`,
  ].filter(Boolean);

  // Always log for debugging — visible in Vercel logs
  console.log("[audit-submit]", {
    firstName,
    email,
    arcStage,
    composite: scoreResult?.composite,
    anchor: scoreResult?.anchor,
    edge: scoreResult?.edge,
    route,
    landedLine,
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
    // NOTE: exact Circle API shape may need adjustment once we have docs from
    // the other Claude Code session handling Circle setup. This is a best-guess
    // based on Circle's standard Community Members API.
    const circleRes = await fetch(
      `https://app.circle.so/api/v1/community_members`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${circleToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name: firstName,
          community_id: circleCommunityId,
          tag_list: tags,
          skip_invitation: false, // Circle's invite-on-create
          // custom fields — to be wired up once the schema is finalized in Circle admin
          custom_fields: {
            audit_arc_stage: arcStage,
            audit_anchor: scoreResult?.anchor,
            audit_edge: scoreResult?.edge,
            audit_composite: scoreResult?.composite,
            audit_route: route,
            audit_landed_line: landedLine,
            audit_landed_line_other: landedLineOther,
            audit_meta_edge_other: metaEdgeOther,
            audit_modern_tools_note: modernToolsNote,
          },
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
