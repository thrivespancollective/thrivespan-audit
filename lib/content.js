// All audit content — v6 from Helios.
// Modify here when iterating; pushes auto-deploy via Vercel.

export const HERO = {
  title: "The Queenager Code",
  subtitle: "Decode your anchor. Decode your edge. Decode your playbook.",
  body: [
    "You don't have an information problem.",
    "You have a system problem.",
    "",
    "The Queenager Code names the ONE pillar you can rely on no matter what (your anchor) and the ONE pillar that runs off the rails when life gets loud (your edge) — then hands you the play that connects them.",
    "",
    "Numbers AND instinct. The two together name the play.",
    "",
    "About 8 minutes. 22 statements. 4 pillars.",
    "The playbook for when you're winning AND for when you slip.",
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
      body: "I have a system. I'm refining the edges.",
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

// Pillar intros
export const PILLAR_INTROS = {
  move: "Move is the obvious pillar — and the one most Queenagers haven't honestly audited in years, because they've been \"doing fitness\" their whole lives.",
  nourish: "Nourish covers fuel, the markers, the supplements, the modern tools. It's the pillar with the most moving parts — and the most personal truth.",
  restore: "Restore is the pillar most Queenagers under-credit. Sleep, regulation, recovery — they're not the soft part of the system. They're the platform.",
  connect: "Connect is relationships with others AND the one you have with yourself. Loneliness has measurable health consequences. Sisterhood is a measurable health response.",
};

// Transitions between pillars
export const TRANSITIONS = {
  afterMove: {
    progress: "5 of 22.",
    body: "Move is the obvious one. Now we go to the pillar most Queenagers don't realize is talking to their training.",
  },
  afterNourish: {
    progress: "11 of 22. Halfway home.",
    body: "Nourish is downstream of stress. Watch this next pillar carefully — it's the most-skipped, and the most load-bearing.",
  },
  afterRestore: {
    progress: "16 of 22.",
    body: "Restore is the pillar most Queenagers under-train. This last one is the pillar most Queenagers underestimate.",
  },
  afterConnect: {
    progress: "22 of 22.",
    body: "You've named what's in each pillar. Now let's name what's in your INSTINCT about them. This is the part most audits skip — and it's the part that tells me the most.",
  },
};

// 22 pillar questions (Move 5, Nourish 6, Restore 5, Connect 6)
export const QUESTIONS = [
  // MOVE — 5
  {
    id: "move_1",
    pillar: "move",
    title: "My strength shows up where it counts.",
    body: "Heavy groceries to the third floor. Getting off the floor after playing with a kid. A flight of stairs without negotiating with my body. My body still says YES when life asks.",
  },
  {
    id: "move_2",
    pillar: "move",
    title: "I'm lifting heavy enough to build.",
    body: "Not pink-dumbbell territory. Not \"tone.\" Real load — the kind that makes the next day's coffee feel earned.",
  },
  {
    id: "move_3",
    pillar: "move",
    title: "My engine holds through the day.",
    body: "I don't crash at 3pm and white-knuckle the evening. Energy is downstream of training. Mine's running.",
  },
  {
    id: "move_4",
    pillar: "move",
    title: "I have data, not vibes.",
    body: "A strength baseline. A VO2 max number. A resting HR I could quote. Something objective tells me my body's performing — not a feeling I have to talk myself into.",
  },
  {
    id: "move_5",
    pillar: "move",
    title: "I get my structured workouts done — week in, week out.",
    body: "Travel, work fires, slow weeks — the workouts still happen. I have a system that keeps me showing up, not just intending to.",
  },

  // NOURISH — 6
  {
    id: "nourish_1",
    pillar: "nourish",
    title: "Food is something I enjoy, not something I battle, dread, or fear.",
    body: "Meals are part of my life, not an opponent. I'm not negotiating with breakfast or hiding from dinner.",
  },
  {
    id: "nourish_2",
    pillar: "nourish",
    title: "I'm happy with my body composition — or at least the direction it's going.",
    body: "I trust the muscle I've built. I feel good in my body. I'm not avoiding the full-length mirror at the end of the day.",
  },
  {
    id: "nourish_3",
    pillar: "nourish",
    title: "I know my metabolic data — and I have a take on it.",
    body: "Bloodwork. Body comp. The markers that matter for THIS season. I've moved past \"normal range\" into \"optimal for me.\"",
  },
  {
    id: "nourish_4",
    pillar: "nourish",
    title: "I have clear awareness of what I'm eating — AND why.",
    body: "Whether I track macros, meal prep on Sunday, count protein in my head, or have a felt sense from years of consistency — I know what's going in, and I know why each thing is on the plate.",
  },
  {
    id: "nourish_5",
    pillar: "nourish",
    title: "Food is planned, not reactive.",
    body: "The week is set up — I'm not in \"whatever's open at 9pm\" mode. The shopping happens. The prep happens. Food meets me, not the other way around.",
  },
  {
    id: "nourish_6",
    pillar: "nourish",
    title: "My modern tools sit on a habit foundation.",
    body: "If HRT, peptides, GLPs, or supplements are in my picture — or on my radar — they're layered on top of habits I trust. Not instead of them. The tools optimize the foundation; they don't replace it.",
  },

  // RESTORE — 5
  {
    id: "restore_1",
    pillar: "restore",
    title: "I sleep through the night and wake up sharp.",
    body: "Brain fog isn't my baseline. The word I'm reaching for shows up when I need it.",
  },
  {
    id: "restore_2",
    pillar: "restore",
    title: "I have a settled baseline I can return to.",
    body: "I'm not running amped up all the time. When something throws me — a bad night, a stressor, a loud day — I can find calm without manufacturing it. There's a baseline; I know how to get back to it.",
  },
  {
    id: "restore_3",
    pillar: "restore",
    title: "I have a daily anchor practice.",
    body: "Meditation, breath, prayer, journaling — whatever mine is, it's in the rotation most days. Even when I don't feel like it. Especially when I don't feel like it.",
  },
  {
    id: "restore_4",
    pillar: "restore",
    title: "My cognitive sharpness matches my career sharpness.",
    body: "I'm not avoiding the conversation about brain longevity. I'm training against it.",
  },
  {
    id: "restore_5",
    pillar: "restore",
    title: "Whatever runs in my family doesn't run me.",
    body: "I know the genetic story. I have a system that says: this is the trajectory I'm choosing.",
  },

  // CONNECT — 6
  {
    id: "connect_1",
    pillar: "connect",
    title: "My primary relationship is solid.",
    body: "Partner, family, my dearest person — whoever holds that seat for me — I can drop the polished version with them and be the actual one. They see me, they challenge me, they're in this season with me.",
  },
  {
    id: "connect_2",
    pillar: "connect",
    title: "There's someone I can be utterly vulnerable with.",
    body: "Not the version I post. The actual one. The 3am version. The \"I'm scared\" version. The \"I don't know what's happening in my body\" version. At least one person holds that with me.",
  },
  {
    id: "connect_3",
    pillar: "connect",
    title: "I show up for my body the way I show up for the people I love.",
    body: "Consistently. Not just on the weeks I have margin.",
  },
  {
    id: "connect_4",
    pillar: "connect",
    title: "I feel powerful AND sexy in the body I have now.",
    body: "Capability is doing the work. Aesthetics is the byproduct.",
  },
  {
    id: "connect_5",
    pillar: "connect",
    title: "I belong to a room of women in this season.",
    body: "A circle. A sisterhood. A group that gets it without me explaining. I'm not navigating this with Google and the algorithm.",
  },
  {
    id: "connect_6",
    pillar: "connect",
    title: "I see my people in real life — not just through screens.",
    body: "Coffee. Walks. Training partners. Dinners. Retreats. The in-person layer is alive in my week, not just my feed.",
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

// Egg #2 — closing resonance
export const LANDED_LINE = {
  prompt: "One last thing — pick the line that landed hardest while you were taking this.",
  hint: "22 of 22. Done with the rating.",
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
    "Your full Anchor + Edge + Leverage Play + Re-Anchor Routine (PDF)",
    "A 30-minute recording walking through what YOUR combo means — and the next habit",
    "A personalized next-step recommendation",
  ],
  modernToolsHint:
    "Optional — anything I should know about modern protocols you're using or considering? (HRT, peptides, GLPs — totally fine to skip)",
  newsletterHint:
    "You'll also get my Friday newsletter — written for Queenagers building toward Stronger at 60. Unsubscribe in one click, no hard feelings.",
  cta: "Reveal My Code",
};
