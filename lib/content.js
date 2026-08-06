// ============================================================================
// IT'S NOT DISCIPLINE — the TeamQueen assessment
// ============================================================================
// Rebuilt 2026-08-05 from the Queenager Code. Same engine, new content.
//
// WHAT CHANGED: the Code rated 22 pillar statements 1-4 and returned an
// anchor + lever. This asks 8 scenario questions and returns ONE BLOCKER —
// the reason she isn't doing what she already knows to do.
//
// The four blockers (grounded in COM-B / Fogg, sourced from real VoC):
//   unguarded   — no pre-decided slot exists; whatever's loudest takes the hour
//   unwitnessed — nobody's expecting her; no social pull on the behaviour
//   tabs        — decision overload; the cost of choosing exceeds the threshold
//   overdrawn   — capacity, not desire; outbid daily by something louder
//
// SCORING (accuracy over a round number — Juls's call 2026-08-05:
// "we need it to be accurate findings or we will lose her trust"):
//   1. Q1 counts DOUBLE. It's the most direct question on the test, so her
//      instinct there is the highest-signal answer. Weighting it also makes
//      mathematical ties much rarer.
//   2. Highest weighted tally wins.
//   3. Tie involving unguarded vs overdrawn → Q9 resolves it. Those two are the
//      pair most likely to be confused ("no time" reads both ways), so Q9 asks
//      the one question that separates them cleanly.
//   4. Any other tie → Q1's answer wins.
//
// Spec + all downstream copy: Helios → OfferFlow/TeamQueen_OfferWeb.md
// Modify here when iterating; pushes auto-deploy via Vercel.
// ============================================================================

export const HERO = {
  title: "It's Not Discipline",
  subtitle: "You've saved fifty protocols to your Instagram. So why hasn't one of them made it into your week?",
  body: [
    "You know the protocols. You could teach the protocols. There's a folder of plans you paid for, a shelf of books you finished, and a saved folder you've never opened twice.",
    "",
    "None of that is the problem. You have enough information to run a clinic.",
    "",
    "What's missing is the doing.",
    "",
    "You're not chasing who you were. You know better than that. You're after the woman you now have the wisdom to be: strong, seen, and yes — sexy, in the body you're standing in.",
    "",
    "She isn't in the mirror yet. She isn't gone, either. Something's in her way.",
    "",
    "It's one of four things. Not one of them is willpower.",
    "",
    "Nine questions. Three minutes.",
    "",
    "You'll know exactly what's standing between you and doing it — and one specific thing to do about it now.",
  ],
  cta: "Find Her",
};

// ---------------------------------------------------------------------------
// THE EIGHT QUESTIONS
// Every question is single-select with four options, one per blocker.
// OPTION ORDER IS DELIBERATELY SHUFFLED so there's no positional pattern —
// the `id` carries the mapping, never the position.
// ---------------------------------------------------------------------------

export const META_QUESTIONS = [
  {
    id: "q1_tuesday",
    type: "single-select",
    title: "It's Tuesday. You meant to do the thing. You didn't. Which is closest to the truth?",
    options: [
      { id: "unguarded", label: "Something came up and took the time", body: "" },
      { id: "unwitnessed", label: "Nobody would have noticed either way", body: "" },
      { id: "tabs", label: "I couldn't decide which thing to do, so I did none of them", body: "" },
      { id: "overdrawn", label: "I had nothing left by the time I got to it", body: "" },
    ],
  },
  {
    id: "q2_saturday",
    type: "single-select",
    title: "A friend texts: \"Walk Saturday morning?\" Honest first thought?",
    options: [
      { id: "tabs", label: "Saturday was when I was going to do the strength thing. Or the meal prep.", body: "" },
      { id: "unguarded", label: "Yes — finally something on the calendar", body: "" },
      { id: "overdrawn", label: "I should. I'm already behind on everything else.", body: "" },
      { id: "unwitnessed", label: "Yes, and I'll actually go, because she'll be there", body: "" },
    ],
  },
  {
    id: "q3_sideways",
    type: "single-select",
    title: "Your week goes sideways on Wednesday. What happens to the plan?",
    options: [
      { id: "unwitnessed", label: "I don't tell anyone. I quietly stop.", body: "" },
      { id: "overdrawn", label: "It was the first thing to go, because everything else couldn't be", body: "" },
      { id: "unguarded", label: "Gone. It was never really written down.", body: "" },
      { id: "tabs", label: "I start looking for a better plan for next week", body: "" },
    ],
  },
  {
    id: "q4_calendar",
    type: "single-select",
    title: "What's on your calendar right now that's only for you?",
    options: [
      { id: "overdrawn", label: "Nothing, and there's no room for it either", body: "" },
      { id: "tabs", label: "Several options I keep meaning to choose between", body: "" },
      { id: "unguarded", label: "Nothing — everything on there involves somebody else", body: "" },
      { id: "unwitnessed", label: "A few things, but nobody's expecting me at them", body: "" },
    ],
  },
  {
    id: "q5_handed",
    type: "single-select",
    title: "Someone hands you the workout, the meal, and the bedtime. All decided.",
    options: [
      { id: "unwitnessed", label: "Perfect — if someone checks whether I did it", body: "" },
      { id: "unguarded", label: "Perfect — if it's at a time I've actually got", body: "" },
      { id: "tabs", label: "That's exactly what I want. Just tell me.", body: "" },
      { id: "overdrawn", label: "Perfect — if it's small. I don't have much to give right now.", body: "" },
    ],
  },
  {
    id: "q6_consistent",
    type: "single-select",
    title: "Think of a stretch when you WERE consistent. What was different?",
    options: [
      { id: "tabs", label: "I only had to do one thing", body: "" },
      { id: "overdrawn", label: "I had more room in my life", body: "" },
      { id: "unwitnessed", label: "Someone was waiting for me", body: "" },
      { id: "unguarded", label: "It had a set time I didn't have to think about", body: "" },
    ],
  },
  {
    id: "q7_couldif",
    type: "single-select",
    title: "Finish it honestly. \"I could do this if…\"",
    options: [
      { id: "unguarded", label: "…it had an hour that was actually mine", body: "" },
      { id: "overdrawn", label: "…I had anything left at the end of the day", body: "" },
      { id: "unwitnessed", label: "…someone was doing it with me", body: "" },
      { id: "tabs", label: "…someone told me which one to do", body: "" },
    ],
  },
  {
    id: "q8_story",
    type: "single-select",
    title: "What do you tell yourself about why it hasn't happened yet?",
    options: [
      { id: "overdrawn", label: "It's not my turn right now", body: "" },
      { id: "unwitnessed", label: "I have no discipline", body: "" },
      { id: "unguarded", label: "I'm too busy", body: "" },
      { id: "tabs", label: "I haven't found the right approach yet", body: "" },
    ],
  },
  // -------------------------------------------------------------------------
  // Q9 — THE SEPARATOR. Asked of everyone, used only when unguarded and
  // overdrawn tie. Those two both present as "no time," and the difference is
  // whether the HOUR is missing or the CAPACITY is. This is the one question
  // that tells them apart, and a real woman answers it honestly in two seconds.
  // -------------------------------------------------------------------------
  {
    id: "q9_freehour",
    type: "single-select",
    title: "Last one. A clear hour appears on your calendar tomorrow. Nothing in it.",
    options: [
      { id: "unguarded", label: "I'd use it for myself. I just needed the hour.", body: "" },
      { id: "overdrawn", label: "Honestly? I'd fill it with something for someone else.", body: "" },
    ],
  },
];

// ---------------------------------------------------------------------------
// RETIRED — kept as empty exports so page.js imports don't break.
// The Queenager Code's pillar-rating architecture (22 rated statements, an
// arc-stage opener, a 1-10 trust scale) is gone. Juls's call 2026-08-05:
// eight questions, one blocker, nothing else. Every screen that doesn't change
// the answer is friction against a three-minute promise.
// ---------------------------------------------------------------------------

export const QUESTIONS = [];
export const RATING_OPTIONS = [];
export const PILLAR_INTROS = {};
export const TRANSITIONS = {};
export const ARC_STAGE = { prompt: "", hint: "", options: [] };

// ---------------------------------------------------------------------------
// EMAIL CAPTURE — she sees her result on screen AND gets it in her inbox.
// No teaser-gating, no withholding. She answered honestly; she gets the answer.
// ---------------------------------------------------------------------------

export const EMAIL_CAPTURE = {
  title: "Where should I send it?",
  benefits: [
    "Your result and your one move — on the next screen and in your inbox",
    "An invitation to the room where you actually do it",
    "The TeamQueen letter. Unsubscribe in one click, no hard feelings.",
  ],
  modernToolsHint: "",
  newsletterHint: "",
  cta: "Find Her",
};
