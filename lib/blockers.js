// ============================================================================
// BLOCKER SCORING — "It's Not Discipline"
// ============================================================================
// Replaces the Queenager Code's weighted pillar math (lib/scoring.js) with a
// four-bucket tally. Simpler, and built for one job: name the ONE thing in her
// way, accurately enough that she trusts the answer.
//
// Juls, 2026-08-05: "we need it to be accurate findings or we will lose her
// trust." That's the whole design brief for this file.
// ============================================================================

export const BLOCKERS = ["unguarded", "unwitnessed", "tabs", "overdrawn"];

// Q1 is the most direct question on the test — "you meant to do it, you didn't,
// which is closest to the truth?" Her instinct there is the highest-signal
// answer we get, so it counts double. This also makes ties materially rarer.
const WEIGHTS = { q1_tuesday: 2 };
const DEFAULT_WEIGHT = 1;

// Q9 exists only to separate unguarded from overdrawn. Both present as "no
// time"; the difference is whether the HOUR is missing or the CAPACITY is.
const SEPARATOR_QID = "q9_freehour";
const SEPARATES = ["unguarded", "overdrawn"];

/**
 * @param {Object} answers  { [questionId]: blockerId }
 * @returns {{ blocker: string, tally: Object, confidence: string,
 *             margin: number, tiebreak: string|null }}
 */
export function scoreBlockers(answers = {}) {
  const tally = { unguarded: 0, unwitnessed: 0, tabs: 0, overdrawn: 0 };

  for (const [qid, choice] of Object.entries(answers)) {
    // Q9 is a separator, not a scored question — counting it would bias the
    // two blockers it exists to tell apart.
    if (qid === SEPARATOR_QID) continue;
    if (!BLOCKERS.includes(choice)) continue;
    tally[choice] += WEIGHTS[qid] ?? DEFAULT_WEIGHT;
  }

  const max = Math.max(...BLOCKERS.map((b) => tally[b]));
  const leaders = BLOCKERS.filter((b) => tally[b] === max);

  let blocker = leaders[0];
  let tiebreak = null;

  if (leaders.length > 1) {
    const separatorPick = answers[SEPARATOR_QID];
    const unguardedVsOverdrawn =
      leaders.length === 2 && SEPARATES.every((b) => leaders.includes(b));

    if (unguardedVsOverdrawn && SEPARATES.includes(separatorPick)) {
      // The tie this test was designed to resolve.
      blocker = separatorPick;
      tiebreak = "separator";
    } else if (leaders.includes(answers.q1_tuesday)) {
      // Any other tie: her most direct answer wins.
      blocker = answers.q1_tuesday;
      tiebreak = "q1";
    } else if (separatorPick && leaders.includes(separatorPick)) {
      blocker = separatorPick;
      tiebreak = "separator-fallback";
    } else {
      // Nothing resolved it. Deterministic so the same answers always give the
      // same result — never random. A woman who retakes it must get the same
      // reading, or the whole thing loses credibility.
      blocker = leaders[0];
      tiebreak = "order";
    }
  }

  // How clearly she landed. Not surfaced in v1, but captured so we can see
  // whether the instrument actually discriminates once real data exists.
  const sorted = [...BLOCKERS].sort((a, b) => tally[b] - tally[a]);
  const margin = tally[sorted[0]] - tally[sorted[1]];
  const confidence = margin >= 4 ? "high" : margin >= 2 ? "clear" : "narrow";

  return { blocker, tally, confidence, margin, tiebreak };
}

// Everything routes to Your First Win. Juls's call 2026-08-05 — the room
// structurally solves all four blockers, so there is no branching route.
// Kept as a function so the call site reads the same as the old app.
export function routeFromBlocker() {
  return "first_win";
}

// ============================================================================
// THE FOUR RESULT CARDS
// ============================================================================
// Voice rules that govern every word below (Helios → ThriveSpan_Voice_Identity
// § THE CHARACTER): name the SITUATION, never her character. Credit her power,
// never her effort. No defending ("you're not lazy" plants the word). Concrete
// images over abstractions. Vary the rhythm; land short.
//
// `promise` is the fix Juls landed on: same room for everyone, DIFFERENT WIN
// per blocker. The room already supplies all four fixes structurally — the copy
// just has to say which one is hers.
// ============================================================================

export const BLOCKER_COPY = {
  unguarded: {
    name: "You're Unguarded",
    subject: "You're Unguarded.",
    mirror: [
      "Your calendar is a buffet and you're last through the line.",
      "Every hour has somebody else's name on it. So Tuesday arrives, something gets loud — a kid, a meeting, a text that could have waited — and the hour's gone before you sat down.",
      "You didn't lose it. You never put your name on it.",
    ],
    move: "Take an hour. Write your name on it. Defend it like it belongs to someone important. It does.",
    promise:
      "One hour. Your name on it. Same time every week — and we'll build the version that survives a bad Tuesday.",
  },

  unwitnessed: {
    name: "You're Unwitnessed",
    subject: "You're Unwitnessed.",
    mirror: [
      "You will move a mountain for someone who's counting on you. Nobody is counting on you for this.",
      "So it doesn't happen. And then — this is the part that gets me — you decide that's a character flaw.",
      "It isn't. You don't need discipline. You need a witness.",
    ],
    move: "Tell one person what you're doing and when. One text. Then watch what your week does.",
    promise:
      "You'll set it up out loud, in front of women who'll notice next week whether you did it. That's the part you've been missing.",
  },

  tabs: {
    name: "You've Got Too Many Tabs Open",
    subject: "You've got too many tabs open.",
    mirror: [
      "6am. You're in the kitchen. You know exactly what to do — and so do the four podcasts arguing in your head about which one matters most.",
      "6:20. Coffee's cold. You've done none of it.",
      "You didn't run out of discipline. You ran out of decisions.",
    ],
    move: "Pick one. Don't research it. Don't optimize it. Don't check whether there's a better one — there is, and it doesn't matter.",
    promise:
      "You'll be handed one move. No menu, no research, nothing to decide. Turns out that's all you needed.",
  },

  overdrawn: {
    name: "You're Overdrawn",
    subject: "You're Overdrawn.",
    mirror: [
      "It's 9pm and someone needs something. You say yes, because you always say yes. The thing you meant to do for yourself moves to tomorrow — where it will meet another 9pm.",
      "You could find the hour. That was never the problem and we both know it. By the time your turn comes, everyone else has already made a withdrawal.",
      "You're not out of want. You're out of funds.",
      "Nobody thrives on the leftovers of themselves.",
    ],
    move: "One deposit. Five minutes, on the calendar, for you and nobody else. Yes, five counts.",
    promise:
      "Nobody in this room will ask you for more than you've got. We start at five minutes and we mean it.",
  },
};

// Shared tail — identical under all four results.
export const RESULT_CTA = {
  lead: "AND do it with us.",
  body: "Come together with women who'll notice next week whether you did it. That's the part you've been missing.",
  offer: "Your First Win — one hour. You leave having done the thing.",
  times: "Mon 10am · Wed 12pm · Thu 6pm CT",
  // "I'm in" over "Take your seat" (panel, 2026-08-05 — Valerie + Allie over
  // Amy's proven "Save my seat"). First person converts better than second,
  // and this brand sells the decision, not the reservation.
  cta: "I'm In",
  signoff: "XO,\nJuls — your TeamQueen Captain",
};
