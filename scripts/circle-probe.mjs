// Circle tag-firing probe / verifier. Run with the live API token to:
//   1. List the member tags that exist in Circle (name → id).
//   2. Check which of the audit's expected tags exist vs. need creating.
//   3. Optionally fire a real test contact to prove tags actually stick.
//
// Usage (token from Circle → Developers → Tokens):
//   CIRCLE_API_TOKEN=xxx CIRCLE_COMMUNITY_ID=123 node scripts/circle-probe.mjs
//   ... add a live test capture (creates a real audience lead):
//   CIRCLE_API_TOKEN=xxx CIRCLE_COMMUNITY_ID=123 node scripts/circle-probe.mjs --capture you+test@example.com
//
// Read-only by default. Only --capture writes to Circle.

import { buildAuditTags } from "../lib/tags.js";
import { getTagMap, resolveTagIds, captureLeadWithTags } from "../lib/circle.js";

const token = process.env.CIRCLE_API_TOKEN;
const communityId = process.env.CIRCLE_COMMUNITY_ID;

if (!token || !communityId) {
  console.error("Missing CIRCLE_API_TOKEN and/or CIRCLE_COMMUNITY_ID env vars.");
  process.exit(1);
}

// A representative Sarah-style submission — every tag a real audit can produce.
const sampleTags = buildAuditTags({
  arcStage: "assembly",
  scoreResult: { anchor: "move", edge: "connect", composite: 62 },
  metaAnswers: { meta_edge: "restore" },
  route: "realm",
});

const main = async () => {
  console.log("→ Listing member tags in Circle…");
  const tagMap = await getTagMap(token, communityId, { force: true });
  console.log(`  ${tagMap.size} tags exist in Circle.\n`);

  const { ids, missing } = resolveTagIds(tagMap, sampleTags);
  console.log("Sample audit submission would request these tags:");
  for (const name of sampleTags) {
    const id = tagMap.get(name.toLowerCase());
    console.log(`  ${id ? "✓" : "✗ MISSING"}  ${name}${id ? `  (id ${id})` : ""}`);
  }
  console.log(`\nResolved ${ids.length}/${sampleTags.length}. Missing ${missing.length}.`);
  if (missing.length) {
    console.log("Create these in Circle (Audience → Member tags) so they fire:");
    console.log("  " + missing.join("\n  "));
  }

  const captureFlag = process.argv.indexOf("--capture");
  if (captureFlag !== -1) {
    const email = process.argv[captureFlag + 1];
    if (!email) {
      console.error("\n--capture needs an email: --capture you+test@example.com");
      process.exit(1);
    }
    console.log(`\n→ Firing live test capture for ${email}…`);
    const res = await captureLeadWithTags(token, communityId, {
      email,
      name: "Probe Test",
      tagNames: sampleTags,
    });
    console.log("  status:", res.status, res.ok ? "OK" : "FAILED");
    console.log("  tags Circle confirms applied:", res.appliedTags ?? "(none echoed)");
    console.log("  missing (not in Circle):", res.missingTags);
    if (!res.ok) console.log("  body:", res.body);
  }
};

main().catch((err) => {
  console.error("Probe failed:", err.message);
  process.exit(1);
});
