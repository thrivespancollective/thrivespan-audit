// Results-page content — anchor paragraphs, edge paragraphs, integration insights,
// leverage plays, re-anchor routines, routed CTAs.
// All voice-locked per v6 spec.

// ANCHOR — Block A — affirms what's working
export const ANCHOR_COPY = {
  move: {
    headline: "Your anchor is Move.",
    body: "You've built a body that performs. You'll show up to the workout even when the rest of life is fraying. The dopamine, the identity, the structure — they're locked in. Most Queenagers your age would trade what you've built for almost any other gain. Move is your easy button — calendar, identity, structure all in place. That's the leverage. Hold onto it as we name the lever.",
  },
  nourish: {
    headline: "Your anchor is Nourish.",
    body: "You've stopped fighting food. You're fueling for performance, not control. You know what your body responds to and you've built a pattern that holds. Fueling is a regulating signal — it's a quiet superpower most Queenagers haven't earned yet. It's the platform every other pillar can build on.",
  },
  restore: {
    headline: "Your anchor is Restore.",
    body: "You've claimed your nervous system. You sleep. You recover. You've built calm into your week as load-bearing, not luxury. That makes you a rare Queenager — most are running on borrowed parasympathetic time. You're running on your own. Restore is the platform; whatever the lever is, you can build on it from green.",
  },
  connect: {
    headline: "Your anchor is Connect.",
    body: "You're not doing this alone. You have your women. You've claimed sisterhood as health intervention, not decoration. That's the pillar most Queenagers can't access on their own — and it's the one that holds every other pillar when life gets loud. Witnessed action compounds. You already have your witnesses.",
  },
};

// EDGE — Block B — names the work
export const EDGE_COPY = {
  move: {
    headline: "Your lever is Move.",
    body: "Most likely, what's showing up in your life right now: your workouts feel like work without payoff. You're putting in the cardio your Garmin tells you to and the scale doesn't move. You're not sure if you're lifting heavy enough to build — and somewhere underneath, you know the body that built you at 35 isn't responding to the same playbook now.",
    reframe: "That's not your failing. The math changed.",
    closer: "The work for you isn't \"exercise more.\" It's the RIGHT load + the RIGHT frame + the system that holds it when life gets loud. We measure. We load. We progress. And we don't apologize for treating you like the performance athlete you actually are.",
  },
  nourish: {
    headline: "Your lever is Nourish.",
    body: "Most likely, what's showing up in your life right now: your bloodwork comes back \"normal\" and you feel anything but. You eat protein now and the scale doesn't move. You may be considering — or already using — HRT, peptides, or a GLP, and somewhere underneath you know the habits aren't matching the tools.",
    reframe: "That's not your failing. The system shifted.",
    closer: "The work for you isn't \"eat better.\" It's the metabolic system that holds the modern tools on top of it — and the data that proves you're moving forward. Real food. Real fueling. Real markers. We don't chase resets. We build a foundation that compounds.",
  },
  restore: {
    headline: "Your lever is Restore.",
    body: "Most likely, what's showing up in your life right now: you're not sleeping but you keep pushing. You lost a word mid-sentence in a meeting last week and felt the small chill. The brain fog you didn't have at 35 is the one you're trying not to name. And if Alzheimer's or dementia runs in your family, there's a quiet hum underneath: \"is this just how it is now?\"",
    reframe: "That's not your failing. The body's flush cycle stopped working the way it used to — and no one handed you the new playbook.",
    closer: "The work for you isn't \"try harder to sleep.\" It's nervous system regulation as load-bearing training — not a luxury, not a vibe. Restore is the brain's flush cycle. Train it. The data on what consistent sleep + parasympathetic practice does for cognitive resilience is staggering. We use it.",
  },
  connect: {
    headline: "Your lever is Connect.",
    body: "Most likely, what's showing up in your life right now: you're doing this alone with Google and contradicting podcasts. Your closest people don't know what's happening in your body. You haven't bought clothes in two years because nothing feels like you anymore — and somewhere underneath, you wonder if you'll feel sexy again, and feel a flicker of shame for caring at all.",
    reframe: "That's not your failing. The world hasn't built a room for the woman you're becoming. We did.",
    closer: "The work for you isn't \"reach out more.\" It's belonging to a room of Queenagers in your season who get it without explanation. Loneliness is a measurable health risk (Holt-Lunstad meta-analysis: equivalent to smoking 15 cigarettes a day). Sisterhood is a measurable health response. We treat community as clinical intervention. Because it is.",
  },
};

// INTEGRATION INSIGHT — Block C — names the combo relationship
// Indexed by `${anchor}_${edge}`
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

// LEVERAGE PLAY — Block D — the AH HAH
// Indexed by `${anchor}_${edge}`
export const LEVERAGE_PLAYS = {
  move_restore: {
    intro: "Your Move pillar is your easy button — it happens, reliably. Calendar slot locked in, identity locked in, structure in place. The play isn't ADDING more Move. It's using that easy button as the place to STACK the Restore practice you've been meaning to install.",
    play: "The play: swap ONE weekly high-arousal session (swim, HIIT, intense cardio) with a low-arousal session (yin yoga, surrender practice, walking nature). Same time slot. Same calendar block. The structure is already there — you're just changing what fills it.",
    closer: "Habit stacking, not willpower. You're not doing less Move — you're making your Move-structure work for Restore. This is what setting yourself up for success looks like inside the system.",
  },
  move_nourish: {
    intro: "Your Move pillar is your easy button — training shows up week in, week out, set up and structured. The play isn't TRAINING HARDER. It's using that easy button as the cue to stack the Nourish habit you've been not-doing.",
    play: "The play: stack ONE fueling habit onto your post-workout window. The 30-60 minutes after you train is the highest-trust moment of your day — the body is asking for input. Existing cue, new habit on top. Protein hit. Same time. Same place. The structure does the work.",
    closer: "Habit stacking, not willpower. Your training is the structure. Nourish rides on top.",
  },
  move_connect: {
    intro: "Your Move pillar is set up — you train, you load, you show up. The play isn't ADDING fitness. It's using your existing training structure as the doorway into the sisterhood you've been navigating alone.",
    play: "The play: train with ONE woman, ONCE a week. Could be a friend, a sister, a peer. Coffee after counts. The point — shared sweat is shared identity. Connect happens at the intersection of effort.",
    closer: "Habit stacking, not willpower. Your training is the structure. Sisterhood is what stacks onto it.",
  },
  restore_move: {
    intro: "Your Restore pillar is set up — you sleep, you recover, your nervous system is regulated. The play isn't MORE rest. It's using your settled baseline as the platform to install the training habit that hasn't been there.",
    play: "The play: schedule training in your most-rested window (usually AM after a good sleep). You're starting from green. Light load to start. Build progressively. Your nervous system can hold the load — the structure for training just hasn't been set up yet.",
    closer: "Habit stacking, not willpower. Calm first, then load. You're not pushing through — you're loading into recovery.",
  },
  connect_move: {
    intro: "Your Connect pillar is set up — you have your women, your community, your sisterhood. The play isn't BUILDING accountability. It's USING the structure you've already built.",
    play: "The play: name your training intention to ONE woman in your circle. Not to perform for her — to be witnessed. Send her a one-line text after each session. Witnessed action compounds 3×.",
    closer: "Habit stacking, not willpower. Your community is the cue. Training rides on the structure you've already built.",
  },
  nourish_restore: {
    intro: "Your Nourish pillar is set up — you fuel, you eat for performance, the pattern holds. The play isn't OPTIMIZING food further. It's using fueling as the cue to stack a Restore practice.",
    play: "The play: anchor a Restore practice to a meal. The 10 minutes after dinner — instead of reaching for the phone, reach for the breath. Or the walk. Or the yin pose. Food is already a regulating signal — make it the trigger for one MORE.",
    closer: "Habit stacking, not willpower. Your Nourish is the structure. Restore stacks on top.",
  },
  default: (anchor, edge) => ({
    intro: `Your ${cap(anchor)} pillar is your easy button — the place you're already set up to show up. The play isn't ADDING more ${cap(anchor)}. It's using the structure of ${cap(anchor)} as the cue to stack the ${cap(edge)} habit you've been meaning to install.`,
    play: `The play: identify ONE ${cap(edge)} habit you can stack onto something you ALREADY do in ${cap(anchor)}. The cue is your existing structure. The new habit rides on top of it. Same time. Same place. Different signal.`,
    closer: "Habit stacking, not willpower. One anchor, one lever, one wedge. Structure beats discipline every time.",
  }),
};

// RE-ANCHOR ROUTINE — Block E — the slip protocol
export const REANCHOR_ROUTINES = {
  move_restore: {
    headline: "When Restore slips, here's the routine that pulls you back before the spiral deepens:",
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

// CTAs — Block F — routed by composite score + edge pillar
export const CTA_COPY = {
  masterclass: {
    headline: "Your next step: The Masterclass.",
    body: "You're running a tight system. The Masterclass is where the nuances and details get worked — the reframe, the 4-pillar lens, your first move. Watch it on your own schedule.",
    details: "Recorded. Watch anytime. $39.",
    button: "Get the Masterclass",
    href: "https://thrivespanworkshop.carrd.co",
    secondaryHref: "https://thrivespancollective.circle.so",
    secondaryButton: "Tell me about the Lab",
  },
  sus_lab: {
    headline: "Your next step: The Set Yourself Up Lab.",
    body: "Your foundation is strong. ONE pillar is your lever. The SUS Lab installs the lever habit in 3 nights — using your anchor as the leverage — and gives you a $147 credit toward Move or Build when you're ready.",
    details: "3 nights. 60 minutes each. $147. $147 credit toward Move Accelerator OR The Build (apply within 14 days).",
    button: "Save my seat",
    href: "https://thrivespancollective.circle.so",
    secondaryButton: "DM Juls",
    secondaryHref: "https://www.linkedin.com/in/juli-fiocca/",
  },
  move_accelerator: {
    headline: "Your next step: The Move Accelerator.",
    body: "Move is where the work is, and you have the time. The Move Accelerator is 12 weeks of strength + cardio + capability, built for the body you have NOW.",
    details: "12 weeks. $579. Next cohort: 3rd Monday of next month.",
    button: "Save my seat",
    href: "https://thrivespanmove.carrd.co",
    secondaryButton: "Tell me about the Lab",
    secondaryHref: "https://thrivespancollective.circle.so",
  },
  the_build: {
    headline: "Your next step: The Build.",
    body: "Your Code revealed the pattern. The Build is where you set up your realm — the structure, the identity, and the accountability that makes every pillar run on autopilot. Not willpower. Not hacks. The realm that holds the whole system.",
    details: "6 months. $1,000 Founder's pricing. Next cohort: 1st Monday of next month.",
    button: "Save my seat",
    href: "https://thrivespanthebuild.carrd.co",
    secondaryButton: "DM Juls",
    secondaryHref: "https://www.linkedin.com/in/juli-fiocca/",
  },
};

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
