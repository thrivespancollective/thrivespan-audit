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
export function buildAuditTags({ arcStage, scoreResult, metaAnswers, route }) {
  // Value convention matches the app: meta_edge is one of move/nourish/restore/
  // connect/not_sure (underscore). Fallback uses the same so the tag resolves.
  const cascadeTrigger = metaAnswers?.meta_edge || "not_sure";
  const routeTag = ROUTE_TAG[route] || route || "unknown";
  return [
    "source-queenager-code",
    "audit-taken",
    `arc-${arcStage || "unknown"}`,
    `anchor-${scoreResult?.anchor || "unknown"}`,
    `lever-${scoreResult?.edge || "unknown"}`,
    `cascade-${cascadeTrigger}`,
    `combo-${scoreResult?.anchor || "unk"}-${scoreResult?.edge || "unk"}`,
    `composite-${compositeBand(scoreResult?.composite)}`,
    `route-${routeTag}`,
  ].filter(Boolean);
}
