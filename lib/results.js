// Results-page content — anchor paragraphs, lever paragraphs, the one move, routed CTAs.
// Voice rebuild 2026-06-25: collapsed the readout from 6 sections → 4 beats
// (What's working / Where your room is / Your one move / Next step). Feedback was
// "wordy and confusing" — root cause was too many concepts + jargon collision
// ("Lever" vs "Leverage Play") + triple-redundant anchor explanations.
// INTEGRATION_COPY + REANCHOR_ROUTINES are PARKED below (kept, not rendered) for
// relocation into the post-Code nurture / Realm Lab.

// ANCHOR — Beat 1 — "WHAT'S WORKING" — affirms the pillar she can rely on.
export const ANCHOR_COPY = {
  move: {
    headline: "You've built a body that performs.",
    body: "You show up to the workout even when the rest of life is fraying — the identity, the structure, the dopamine are locked in. That's rare, and it's your easy button. We're going to use it.",
  },
  nourish: {
    headline: "You've stopped fighting food.",
    body: "You fuel for performance, not control, and you've built a pattern that holds. That's a quiet superpower most Queenagers haven't earned yet — the platform every other pillar builds on.",
  },
  restore: {
    headline: "You've claimed your nervous system.",
    body: "You sleep. You recover. You've made calm load-bearing instead of a luxury — and that makes you rare. Most Queenagers are running on borrowed time; you're running on your own.",
  },
  connect: {
    headline: "You're not doing this alone.",
    body: "You have your women. You've claimed sisterhood as a health intervention, not decoration — the one pillar most Queenagers can't reach on their own, and the one that holds all the others when life gets loud. You already have your witnesses.",
  },
};

// LEVER — Beat 2 — "WHERE YOUR ROOM IS" — opportunity-framed (most room / biggest payoff).
// One tight paragraph: the symptom → "not your failing" → the work. No throat-clear.
export const EDGE_COPY = {
  move: {
    headline: "It's Move.",
    body: "Your workouts feel like work without payoff — the cardio's in, the scale won't move, and underneath you know the body that built you at 35 isn't responding to the old playbook. That's not your failing. The math changed. The work isn't \"exercise more\" — it's the right load and a system that holds when life gets loud. We measure, we load, we progress, and we treat you like the performance athlete you are.",
  },
  nourish: {
    headline: "It's Nourish.",
    body: "Your bloodwork comes back \"normal\" and you feel anything but. You eat protein now and the scale won't move, and if you're on HRT, peptides, or a GLP, you can feel the habits aren't matching the tools. That's not your failing. The system shifted. The work isn't \"eat better\" — it's a metabolic foundation that holds the modern tools on top of it, with data that proves you're moving forward. Real food. Real markers. We build what compounds.",
  },
  restore: {
    headline: "It's Restore.",
    body: "You're not sleeping but you keep pushing. The brain fog you didn't have at 35, the word that slipped mid-sentence last week — and if dementia runs in your family, the quiet \"is this just how it is now?\" That's not your failing. Your body's flush cycle stopped working the way it used to, and no one handed you the new playbook. The work isn't \"try harder to sleep\" — it's nervous system regulation as real training. Restore is the brain's flush cycle. Train it.",
  },
  connect: {
    headline: "It's Connect.",
    body: "You're navigating peri/menopause without women in your season — alone with Google and contradicting podcasts — and the work you put into the other pillars compounds slower because no one's witnessing it. That's not your failing. The world hasn't built a room for the woman you're becoming. We did. The work isn't \"reach out more\" — it's belonging to a room of Queenagers who get it without explanation. Loneliness is a measurable health risk. Sisterhood is the response.",
  },
};

// THE ONE MOVE — Beat 3 — "YOUR ONE MOVE THIS WEEK" — one concrete action.
// Was LEVERAGE_PLAYS {intro, play, closer}; collapsed to {headline, body}.
// Indexed by `${anchor}_${edge}`.
export const LEVERAGE_PLAYS = {
  move_restore: {
    headline: "Swap, don't add.",
    body: "Trade one hard session this week (HIIT, intense cardio) for a low-arousal one (yin, a walk in nature) — same time, same calendar slot. The structure is already there; you're just changing what fills it. That's how Restore gets built: stacked onto the habit you never skip.",
  },
  move_nourish: {
    headline: "Fuel the window.",
    body: "Don't train harder — stack one fueling habit onto the 30–60 minutes after you train, when your body is asking for input. A protein hit, same time, same place. The structure you already have does the work.",
  },
  move_connect: {
    headline: "Train with one woman.",
    body: "Don't add fitness — add a witness. Train with one woman once a week (a friend, a sister, a peer; coffee after counts). Shared sweat is shared identity. Your training is already the structure; sisterhood stacks onto it.",
  },
  restore_move: {
    headline: "Load into your rested window.",
    body: "Don't add more rest — use it. Put training in your most-rested window, usually the morning after a good sleep. Start light and build. You're starting from green; your nervous system can hold the load. The habit just hasn't been set up yet.",
  },
  connect_move: {
    headline: "Say it out loud.",
    body: "Don't build accountability — use what you've built. Name your training intention to one woman in your circle, and send her a one-line text after each session. Not to perform. To be witnessed. Witnessed action compounds.",
  },
  nourish_restore: {
    headline: "Anchor calm to a meal.",
    body: "Don't optimize your food further — attach a Restore practice to a meal. The ten minutes after dinner, reach for the breath or the walk instead of the phone. Food is already a regulating signal; make it the cue for one more.",
  },
  default: (anchor, edge) => ({
    headline: "Stack one onto what already holds.",
    body: `Don't add more ${cap(anchor)} — find one ${cap(edge)} habit you can stack onto something you already do in ${cap(anchor)}. Same cue, same time, new signal. Your easy button is the structure; the new habit rides on top.`,
  }),
};

// CTAs — Beat 4 — Personalized primary per audit signal (v10.4, Approach C). Unchanged.
export const CTA_COPY = {
  masterclass: {
    headline: "Your next step: The Masterclass.",
    body: "You're at the front door — either running a tight system already, or at the Wake-Up ready to name what's shifting. Either way, the Masterclass — Less Knowing. More Doing. — is where the four-pillar lens, the structure that holds the doing, and your first habit get installed.",
    details: "$39",
    button: "Save my seat — The Masterclass",
    href: "https://thrivespanmasterclass.carrd.co",
    secondaryButton: "Or: tell me about Create Your Realm",
    secondaryHref: "https://thrivespanrealm.carrd.co",
  },
  create_your_realm: {
    headline: "Your next step: Create Your Realm.",
    body: "Your foundation is strong, and you have ONE clear lever. Create Your Realm is the lab where you design the conditions — calendar, identity, the Court, easy buttons — that make your lever habit hold. Not willpower. The realm where your Queen Playbook can run.",
    details: "4-hour lab · $147",
    button: "Save my seat — Create Your Realm",
    href: "https://thrivespanrealm.carrd.co",
    secondaryButton: "Or: tell me about the Masterclass first",
    secondaryHref: "https://thrivespanmasterclass.carrd.co",
  },
  move_accelerator: {
    headline: "Your next step: The Move Accelerator.",
    body: "Move is where the work is — and you have the time. The Move Accelerator is 12 weeks of strength + cardio + capability, built for the Queenager body you have NOW. Single-pillar focus, no overwhelm — just the work that compounds.",
    details: "12 weeks · $579 · next cohort: 1st Monday of each month from July.",
    button: "Save my seat — The Move Accelerator",
    href: "https://thrivespanmove.carrd.co",
    secondaryButton: "Or: tell me about Create Your Realm first",
    secondaryHref: "https://thrivespanrealm.carrd.co",
  },
  the_build: {
    headline: "Your next step: Create Your Realm.",
    body: "Your Code revealed the pattern — and you're ready for the system that holds the doing. Create Your Realm is the lab where you design your environment first — the identity, the Court, the schedule, the easy buttons. It's literally Weeks 1-2 of The Build, run standalone. The natural on-ramp.",
    details: "4-hour lab · $147",
    button: "Save my seat — Create Your Realm",
    href: "https://thrivespanrealm.carrd.co",
    secondaryButton: "Or: tell me about The Build",
    secondaryHref: "https://thrivespanthebuild.carrd.co",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PARKED CONTENT — no longer rendered in the readout (cut 2026-06-25 to fix the
// "wordy/confusing" overload). Kept here to relocate into the post-Code nurture
// and the Create Your Realm Lab. Do NOT re-wire into the readout without a voice pass.
// ─────────────────────────────────────────────────────────────────────────────

// INTEGRATION INSIGHT — was Block C — names the combo relationship. Indexed by `${anchor}_${edge}`.
export const INTEGRATION_COPY = {
  move_restore:
    "Your anchor is Move. Your lever is Restore. This combination is the most common one we see in high-performer Queenagers — and it's also the one where the biggest unlock hides. You've been treating training as the answer to everything. Your nervous system has been quietly paying the bill. When Restore gets a system around it, your training compounds at 2-3× the rate. The work you've been doing in Move isn't wasted — it's about to start landing.",
  move_nourish:
    "Your anchor is Move. Your lever is Nourish. You're loading the body. You're not always fueling it for what you're asking it to do. The result: training that builds slower than it should, body comp that doesn't match the work. The Nourish lever isn't a diet question — it's a system question. When fueling matches load, Move starts paying out in months instead of years.",
  restore_move:
    "Your anchor is Restore. Your lever is Move. You've claimed your nervous system; you sleep; you've built calm. What's missing is load — real load. The body needs HEAVY for the season you're in, and you may have backed off training out of an instinct that's serving you in some ways and limiting you in others. Restore is the platform. Move is the build. Both/AND.",
  connect_move:
    "Your anchor is Connect. Your lever is Move. You have your women, your community, your sisterhood — that's the platform most Queenagers can't even access. What's missing is the body matching the woman you've built. Move is the next chapter. The community holds you while you do it.",
  default: (anchor, edge) =>
    `Your anchor is ${cap(anchor)}. Your lever is ${cap(edge)}. Most Queenagers don't realize how much these two talk to each other. The structure you've built in ${cap(anchor)} is the leverage point — the place you're already set up for success. You stack the ${cap(edge)} habit onto it. We don't choose between pillars. We sequence them.`,
};

// RE-ANCHOR ROUTINE — was Block E — the slip protocol.
export const REANCHOR_ROUTINES = {
  move_restore: {
    headline: "When Restore slips, here's the routine that pulls you back before it deepens:",
    steps: [
      "Same bed time. Same wake time. The anchor of the day.",
      "No screens, work, or engaging input for 1 hour before bed.",
      "Fiction over feed.",
      "Bilateral or binaural audio when grounding's hard.",
      "Yin or surrender yoga 2-3 evenings (substituted for any high-arousal session).",
      "No evening workouts until sleep's back online.",
    ],
    closer: "That's your re-anchor protocol. Not the willpower-burning version — the structure version. It uses your Move easy button to do the Restore work.",
  },
  move_nourish: {
    headline: "When Nourish slips, here's the routine that pulls you back before training stops paying out:",
    steps: [
      "Pre-pack 3 protein-anchored snacks Sunday for the week. (Decision made once, deployed seven times.)",
      "Post-workout protein within 60 min, every session. Non-negotiable.",
      "One hot breakfast within an hour of waking. Hot, savory, real food.",
      "Log it for 14 days. Not to control. To see.",
      "The scale isn't the metric. Energy holding through the day is.",
    ],
    closer: "Use your Move-anchor as the cue. The post-workout window is when the body asks. Answer it.",
  },
  move_connect: {
    headline: "When Connect slips, here's the routine that pulls you back:",
    steps: [
      "Send one text per day to one woman in your circle. Not asking — sharing. \"Just trained. Felt strong today.\" That's enough.",
      "Join a room: a Build cohort, a Move Accelerator, a women's group. Belonging compounds.",
      "Schedule one in-person connection per week. Not optional. Treat it like a training session — show up.",
      "Stop consuming wellness alone. Co-consume — listen to a podcast WITH a friend; book club a wellness book; train with a partner.",
      "Loneliness is a measurable health risk. Sisterhood is the response.",
    ],
    closer: "Witnessed action compounds 3×. Train with someone. Tell someone. Be seen.",
  },
  restore_move: {
    headline: "When training slips, here's the routine that pulls you back without breaking what's already working:",
    steps: [
      "Don't sacrifice the sleep to \"make up\" missed workouts. Sleep is your platform — protect it.",
      "Re-enter at the Begin tier. 15 minutes. Two sessions the first week.",
      "Train in your most-rested window (often AM, post-coffee).",
      "Track HRV / resting HR for one week before adding intensity. Let the data confirm the load.",
      "Use the calm of Restore as the runway for the strength of Move.",
    ],
    closer: "You don't fight your nervous system. You partner with it.",
  },
  connect_move: {
    headline: "When Move slips, here's the routine that pulls you back:",
    steps: [
      "Text your woman first. \"I haven't trained in a week. I'm starting Monday.\"",
      "Start at the Begin tier — 15 minutes, bodyweight. The pattern matters, not the dose.",
      "Stack the session onto an existing high-reliability anchor in your week (your Monday call, your morning coffee, your Sunday walk).",
      "One session per week before adding a second. Re-entry, not re-launch.",
      "Report it to your woman. Witnessed = compounded.",
    ],
    closer: "Your community is the cue. Train with witnesses. Pattern beats dose.",
  },
  nourish_restore: {
    headline: "When Restore slips, here's the routine that pulls you back:",
    steps: [
      "Same bed time. Same wake time. (Even when sleep is hard, the structure compounds.)",
      "No screens 1 hour before bed.",
      "Magnesium glycinate 60 min before sleep (your fueling discipline transfers naturally here).",
      "5-min breath protocol post-dinner. Box breath, 4-7-8, or NSDR. Pick one. Repeat.",
      "Track sleep — wearable or journal. Just observe. Data settles the nervous system before anything else does.",
    ],
    closer: "Anchor Restore to the meal. Food is already a regulating signal — make it the trigger for one more.",
  },
  default: (anchor, edge) => ({
    headline: `When ${cap(edge)} slips, here's the structural move that pulls you back:`,
    steps: [
      `Don't try to fix ${cap(edge)} head-on. Start with ${cap(anchor)} — the one you can rely on.`,
      `Stack the ${cap(edge)} habit onto an ${cap(anchor)} cue you don't skip.`,
      "Re-enter at the Begin tier — 5-15 minutes. The pattern matters more than the dose right now.",
      "Track it for two weeks. Just observe. The system shifts when you can see it.",
      "Bring it to your cohort when you have one — witnessed action compounds.",
    ],
    closer: "One anchor. One lever. One wedge. That's the whole system.",
  }),
};

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
