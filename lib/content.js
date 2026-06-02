// All audit content — v6 from Helios.
// Modify here when iterating; pushes auto-deploy via Vercel.

export const HERO = {
  title: "The Queenager Code",
  subtitle: "Decode your anchor. Decode your lever.",
  body: [
    "You don't have an information problem.",
    "You have a system problem.",
    "",
    "The Queenager Code names two things:",
    "",
    "→ Your anchor — the pillar you can rely on, the one that keeps you tethered to your wellness no matter what.",
    "",
    "→ Your lever — the pillar that goes first when pressure rises, and takes the others with it.",
    "",
    "Then it hands you the play that connects them.",
    "",
    "The code for borrowing your anchor's power to stop the slip before it spirals.",
    "",
    "👑 Faster. Stronger. Sexier. Harder to Kill.",
  ],
  cta: "Decode My Code",
};

// Egg #1 — opening calibration
export const ARC_STAGE = {
  prompt: "Before we go in — where are you right now?",
  hint: "Pick the one that sounds most like you. This shapes how I read your results.",
  options: [
    {
      id: "wakeup",
      label: "The Wake-Up",
      body: "Something shifted in the last 6-18 months. I'm trying to name it.",
    },
    {
      id: "reset",
      label: "The Reset",
      body: "I've tried things. Some landed; most didn't. Done collecting. Ready to build.",
    },
    {
      id: "build",
      label: "The Build",
      body: "I have pieces — they don't yet add up to a playbook.",
    },
    {
      id: "command",
      label: "The Command",
      body: "I have a system. I'm fine-tuning it.",
    },
  ],
};

// Rating scale for all 20 pillar questions
export const RATING_OPTIONS = [
  { id: 4, label: "Definitely me right now" },
  { id: 3, label: "Most days" },
  { id: 2, label: "Sometimes" },
  { id: 1, label: "Rarely or never" },
];

// Pillar intros — clean orienting headers (no narration)
export const PILLAR_INTROS = {
  move: "strength · power · capacity",
  nourish: "fuel · metabolic · markers",
  restore: "sleep · nervous system · recovery",
  connect: "relationships · self · belonging",
};

// Transition into the meta/instinct block (the only interstitial we keep).
// Inter-pillar transitions removed 2026-05-28 — the pillar headers provide the beat.
export const TRANSITIONS = {
  afterConnect: {
    progress: "That's the rating.",
    body: "Four quick gut-checks now — what your instinct says, not just your scores. (We'll review/clean this screen together.)",
  },
};

// 22 pillar questions (Move 5, Nourish 6, Restore 5, Connect 6)
export const QUESTIONS = [
  // MOVE — 6
  {
    id: "move_1",
    pillar: "move",
    title: "My fitness shows up when it counts.",
    body: "Groceries up the stairs. Off the floor without thinking. The hike, the long day, the thing that asks something of my body — and it says yes.",
  },
  {
    id: "move_2",
    pillar: "move",
    title: "I strength train with enough load to keep getting stronger.",
    body: "Real load. Progressive — not maintenance mode.",
  },
  {
    id: "move_3",
    pillar: "move",
    title: "I train my cardiovascular system with real variability — easy days and hard efforts.",
    body: "",
  },
  {
    id: "move_4",
    pillar: "move",
    title: "I work on mobility, stability, and bone strength.",
    body: "",
  },
  {
    id: "move_5",
    pillar: "move",
    title: "I'm confident the way I move today will give me the life I want at 60, 80, and 100.",
    body: "",
  },
  {
    id: "move_6",
    pillar: "move",
    title: "I have a well-rounded program I do consistently — pretty much no matter what.",
    body: "",
  },

  // NOURISH — 7
  {
    id: "nourish_1",
    pillar: "nourish",
    title: "Food is nourishment and community — not a battle.",
    body: "",
  },
  {
    id: "nourish_2",
    pillar: "nourish",
    title: "I feel good in the body I have.",
    body: "",
  },
  {
    id: "nourish_3",
    pillar: "nourish",
    title: "I eat real food consistently.",
    body: "",
  },
  {
    id: "nourish_4",
    pillar: "nourish",
    title: "I know my metabolic data — and I act on it.",
    body: "Bloodwork, body comp, the markers that matter.",
  },
  {
    id: "nourish_5",
    pillar: "nourish",
    title: "I'm confident the way I fuel today will give me the metabolic health I want at 60, 80, and 100.",
    body: "",
  },
  {
    id: "nourish_6",
    pillar: "nourish",
    title: "I plan my meals — I'm not winging it day to day.",
    body: "",
  },
  {
    id: "nourish_7",
    pillar: "nourish",
    title: "If modern tools are in my picture — HRT, peptides, GLPs, supplements — they sit on a habit foundation, not instead of one.",
    body: "",
  },

  // RESTORE — 6
  {
    id: "restore_1",
    pillar: "restore",
    title: "I sleep through the night — and wake up rested.",
    body: "",
  },
  {
    id: "restore_2",
    pillar: "restore",
    title: "I build restoration into my training schedule — recovery days, active rest, downshifts.",
    body: "",
  },
  {
    id: "restore_3",
    pillar: "restore",
    title: "I have a daily practice that settles my nervous system.",
    body: "Breath, meditation, prayer, walks — whatever's mine. Most days.",
  },
  {
    id: "restore_4",
    pillar: "restore",
    title: "I have a baseline of calm I can return to — I'm not running amped up all the time.",
    body: "",
  },
  {
    id: "restore_5",
    pillar: "restore",
    title: "My mind is sharp — the word I reach for shows up, and fog isn't my baseline.",
    body: "",
  },
  {
    id: "restore_6",
    pillar: "restore",
    title: "I'm confident my mind will be sharp and resilient at 60, 80, and 100.",
    body: "",
  },

  // CONNECT — 6
  {
    id: "connect_1",
    pillar: "connect",
    title: "I have a primary relationship that's solid — I can be the real me, not the polished version.",
    body: "",
  },
  {
    id: "connect_2",
    pillar: "connect",
    title: "There's at least one person I can be fully vulnerable with — the 3am version, the scared version, the real one.",
    body: "",
  },
  {
    id: "connect_3",
    pillar: "connect",
    title: "I tend to my emotional health as deliberately as my physical health.",
    body: "Therapy, processing, the inner work — actively, not someday.",
  },
  {
    id: "connect_4",
    pillar: "connect",
    title: "I belong to a circle of women in this season — and I'm with them in real life, not just online.",
    body: "",
  },
  {
    id: "connect_5",
    pillar: "connect",
    title: "I feel powerful and sexy in the body I have now — and I like who I'm becoming.",
    body: "",
  },
  {
    id: "connect_6",
    pillar: "connect",
    title: "I'm confident I'll have the love, connection, and belonging I want at 60, 80, and 100.",
    body: "",
  },
];

// Meta block — 4 questions
export const META_QUESTIONS = [
  {
    id: "meta_anchor",
    type: "single-select",
    title: "Of these four pillars, which one MOST keeps you grounded when life gets loud?",
    options: [
      { id: "move", label: "Move", body: "Training is what holds me. Exercise is non-negotiable. I show up half-dead." },
      { id: "nourish", label: "Nourish", body: "Fueling is what holds me. I never miss it. Food is structure." },
      { id: "restore", label: "Restore", body: "Sleep / regulation is what holds me. I protect my baseline above everything." },
      { id: "connect", label: "Connect", body: "My people / my self-relationship is what holds me. It's the layer I won't compromise." },
    ],
  },
  {
    id: "meta_edge",
    type: "single-select",
    title: "When your week falls apart, what's USUALLY the first thing to slip?",
    options: [
      { id: "move", label: "Move first", body: "training disappears" },
      { id: "nourish", label: "Nourish first", body: "food gets reactive" },
      { id: "restore", label: "Restore first", body: "sleep gets weird, the nervous system fries" },
      { id: "connect", label: "Connect first", body: "I isolate, stop reaching out" },
      { id: "not_sure", label: "I'm honestly not sure", body: "it all kind of slides together" },
    ],
    allowOther: true,
  },
  {
    id: "meta_quickwin",
    type: "single-select",
    title: "If you could fix ONE pillar in 12 weeks — which would unlock the most across the others?",
    options: [
      { id: "move", label: "Move", body: "strength + cardio cascading into energy, sleep, body comp" },
      { id: "nourish", label: "Nourish", body: "fueling cascading into body comp, energy, brain" },
      { id: "restore", label: "Restore", body: "sleep + regulation cascading into brain, mood, recovery" },
      { id: "connect", label: "Connect", body: "community + intimacy cascading into adherence, identity, mood" },
      { id: "not_sure", label: "I'm not sure which would cascade most", body: "" },
    ],
  },
  {
    id: "meta_trust",
    type: "scale-1-10",
    title: "On a scale of 1-10, how much do you trust your CURRENT system to carry you through the next decade?",
    hintLow: "1 = \"I'm rebuilding from scratch\"",
    hintHigh: "10 = \"I have a system I'd bet on\"",
  },
];

// REMOVED 2026-06-02: LANDED_LINE (Egg #2 — closing resonance) — cut per Juls.
// The 8 quote-pick question read as AI sludge (lines pulled from broader brand language,
// not from the quiz). We already have anchor/lever/score/instinct/arc-stage/trust for
// personalization — that line-pick added noise, not signal.
const _LANDED_LINE_REMOVED = {
  prompt: "One last thing — pick the line that landed hardest while you were taking this.",
  hint: "Done with the rating.",
  options: [
    { id: "math_changed", line: "The math changed — and no one handed me the new playbook." },
    { id: "anchor_advantage", line: "My anchor pillar is my unfair advantage." },
    { id: "sexy_byproduct", line: "Sexy is a byproduct of capability." },
    { id: "stronger_60", line: "Stronger at 60 than I was at 40." },
    { id: "family_doesnt_run_me", line: "Whatever runs in my family doesn't run me." },
    { id: "drop_polished", line: "I can drop the polished version and be the actual one." },
    { id: "room_of_women", line: "I belong to a room of women in this season." },
    { id: "system_not_info", line: "I don't have an information problem. I have a system problem." },
  ],
  allowOther: true,
};

// Email capture screen
export const EMAIL_CAPTURE = {
  title: "Where should I send your detailed Code reading?",
  benefits: [
    "Your full Anchor + Lever + Leverage Play + Re-Anchor Routine (PDF)",
    "A 30-minute recording walking through what YOUR combo means — and the next habit",
    "A personalized next-step recommendation",
  ],
  modernToolsHint:
    "Optional — anything I should know about modern protocols you're using or considering? (HRT, peptides, GLPs — totally fine to skip)",
  newsletterHint:
    "You'll also get my Friday newsletter — written for Queenagers building toward Stronger at 60. Unsubscribe in one click, no hard feelings.",
  cta: "Reveal My Code",
};
