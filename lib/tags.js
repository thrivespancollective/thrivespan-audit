// Audit → Circle tag taxonomy. Single source of truth for which tags an audit
// submission produces. Imported by the submit route (to fire them) and by
// scripts/circle-probe.mjs (to check which already exist in Circle).
//
// Brand-locked term: "lever" not "edge" — internal scoring still uses `edge`
// for backward compat; user-facing tags use the `lever-` prefix.

export function compositeBand(composite) {
  if (composite == null) return "unknown";
  if (composite >= 70) return "70-80";
  if (composite >= 55) return "55-69";
  if (composite >= 40) return "40-54";
  return "20-39";
}

// Map the routing engine's route keys to offer-language tag suffixes, so
// segments read in Juls's language (route-realm, not the longer internal key).
// Keep in sync if routeFromScore values change.
const ROUTE_TAG = {
  masterclass: "masterclass",
  create_your_realm: "realm",
  move_accelerator: "move",
  the_build: "build",
};

// Build the tag-name list for one submission. Names here must match the tag
// names created in Circle exactly (case-insensitive) or they won't resolve.
//
// REBUILT 2026-08-05 for "It's Not Discipline". The Code's anchor/lever/
// composite/route taxonomy is gone — this assessment returns ONE blocker.
//
// ⚠️ NOTHING IN v1 DEPENDS ON THESE FIRING. The results email is built and
// sent by the app at completion (it already knows the answer), and the day-7
// nurture is written universally. Tags are for LATER segmentation — fire them,
// build the data, but don't block the launch on them. Tag-firing has broken
// before; this design means it can break again without costing a conversion.
//
// ⬜ These four tag names must exist in Circle before they'll resolve:
//    blocker-unguarded · blocker-unwitnessed · blocker-tabs · blocker-overdrawn
export function buildAuditTags({ scoreResult }) {
  const blocker = scoreResult?.blocker || "unknown";
  return [
    "source-not-discipline",
    "assessment-taken",
    `blocker-${blocker}`,
    // Confidence band — lets us check later whether the instrument actually
    // discriminates, or whether everyone lands "narrow" and the questions
    // need sharpening.
    `confidence-${scoreResult?.confidence || "unknown"}`,
  ].filter(Boolean);
}
