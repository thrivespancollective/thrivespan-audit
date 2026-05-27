// Scoring logic — takes answers, returns anchor/edge/composite/routing.

export function scoreAudit(answers) {
  // Pillar scores: sum of 1-4 ratings per pillar
  const pillarScores = {
    move: 0,
    nourish: 0,
    restore: 0,
    connect: 0,
  };

  const pillarCounts = {
    move: 0,
    nourish: 0,
    restore: 0,
    connect: 0,
  };

  for (const [key, value] of Object.entries(answers)) {
    if (key.startsWith("move_")) {
      pillarScores.move += value;
      pillarCounts.move += 1;
    } else if (key.startsWith("nourish_")) {
      pillarScores.nourish += value;
      pillarCounts.nourish += 1;
    } else if (key.startsWith("restore_")) {
      pillarScores.restore += value;
      pillarCounts.restore += 1;
    } else if (key.startsWith("connect_")) {
      pillarScores.connect += value;
      pillarCounts.connect += 1;
    }
  }

  // Normalize per-pillar (divide by count × 4 → 0-1, then × 20)
  // This handles uneven question counts per pillar (Move 5, Nourish 6, Restore 5, Connect 6)
  const normalizedScores = {};
  for (const pillar of ["move", "nourish", "restore", "connect"]) {
    const maxPossible = pillarCounts[pillar] * 4;
    normalizedScores[pillar] =
      maxPossible > 0
        ? Math.round((pillarScores[pillar] / maxPossible) * 20)
        : 0;
  }

  // Anchor = highest normalized score
  // Edge = lowest normalized score
  const sortedPillars = Object.entries(normalizedScores).sort(
    (a, b) => b[1] - a[1]
  );
  const anchor = sortedPillars[0][0];
  const edge = sortedPillars[sortedPillars.length - 1][0];

  // Composite = sum of normalized scores (out of 80)
  const composite =
    normalizedScores.move +
    normalizedScores.nourish +
    normalizedScores.restore +
    normalizedScores.connect;

  // Edge case: all pillars low + anchor == edge (extreme low composite)
  const anchorEdgeMatch = anchor === edge;

  return {
    pillarScores: normalizedScores,
    rawPillarScores: pillarScores,
    pillarCounts,
    anchor,
    edge,
    composite,
    anchorEdgeMatch,
  };
}

// Route to CTA based on composite + edge
export function routeFromScore({ composite, edge }) {
  if (composite >= 70) return "workshop";
  if (composite >= 55) return "sus_lab";
  if (composite >= 40) {
    return edge === "move" ? "move_accelerator" : "the_build";
  }
  // composite < 40
  return "the_build";
}

// Match anchor + edge to specific copy block, else use default
export function matchCombo(anchor, edge, copyMap) {
  const key = `${anchor}_${edge}`;
  if (copyMap[key]) {
    if (typeof copyMap[key] === "function") {
      return copyMap[key](anchor, edge);
    }
    return copyMap[key];
  }
  // Fall back to default
  if (typeof copyMap.default === "function") {
    return copyMap.default(anchor, edge);
  }
  return copyMap.default;
}

// Helper: compare subjective vs. scored anchor for read-back
export function anchorComparison({ scoredAnchor, subjectiveAnchor }) {
  if (!subjectiveAnchor) return null;
  if (subjectiveAnchor === scoredAnchor) {
    return {
      match: true,
      readback:
        "You also said this pillar grounds you most. Your scored anchor and your subjective anchor agree. You know your anchor — that's a premium-buyer signal. We don't have to convince you of what's working; we just have to point it at what's hard.",
    };
  }
  return {
    match: false,
    readback: `You said ${cap(subjectiveAnchor)} grounds you most, but the audit shows ${cap(scoredAnchor)} is doing more of the lifting than you realized. Most Queenagers under-credit what's already working. Let's name it.`,
  };
}

export function edgeComparison({ scoredEdge, subjectiveEdge }) {
  if (!subjectiveEdge) return null;
  if (subjectiveEdge === "not_sure") {
    return {
      match: null,
      readback:
        "You said you weren't sure which slips first. That's its own data point — the audit just named it for you.",
    };
  }
  if (subjectiveEdge === scoredEdge) {
    return {
      match: true,
      readback:
        "You also named this pillar as the first to slip when your week falls apart. Your self-awareness is dialed in.",
    };
  }
  return {
    match: false,
    readback: `You said ${cap(subjectiveEdge)} slips first, but ${cap(scoredEdge)} is the deeper cascade trigger. Here's why that matters for which habit you install first.`,
  };
}

export function quickwinComparison({ leveragePillar, subjectiveQuickwin }) {
  // leveragePillar is the edge (what the Leverage Play installs)
  if (!subjectiveQuickwin || subjectiveQuickwin === "not_sure") return null;
  if (subjectiveQuickwin === leveragePillar) {
    return {
      match: true,
      readback:
        "Your instinct (quick-win pillar) matched the play. You've been seeing it. Now you have the move.",
    };
  }
  return {
    match: false,
    readback: `Your instinct said ${cap(subjectiveQuickwin)} would cascade most. The audit reveals a different play — and it's the move you didn't see coming.`,
  };
}

// Trust score → voice register for Re-Anchor block
export function trustVoiceRegister(trust) {
  if (!trust) return "balanced";
  if (trust <= 3) return "gentle";
  if (trust >= 7) return "sharp";
  return "balanced";
}

export function trustReadback(trust) {
  if (!trust) return null;
  if (trust <= 3) {
    return "You scored low on system trust — you're not rebuilding from scratch even if it feels that way. This Re-Anchor is the foundation work. Begin tier. The pattern matters more than the dose.";
  }
  if (trust >= 7) {
    return `You scored ${trust} / 10 on system trust — you're not rebuilding from scratch. You're refining the edges of a system you already trust. This Re-Anchor is the edge work, not the foundation.`;
  }
  return `You scored ${trust} / 10 on system trust — you have pieces working. This Re-Anchor adds the integration where the slip happens.`;
}

function cap(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
