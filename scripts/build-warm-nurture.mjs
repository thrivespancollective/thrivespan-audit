// scripts/build-warm-nurture.mjs
// Builds the Warm Re-Intro Nurture in Resend:
//   1. Verifies warm.added event exists
//   2. Creates + publishes 5 email templates (Beats 1–5 verbatim from approved source)
//   3. Builds + enables the automation (10 steps: trigger + 5 emails + 4 delays)
//
// DM notifications (Start DM Day 0, Engager DM ~Day 15) are handled by
// add-warm-contact.mjs (direct send to team@ — NOT in the automation, because
// Resend does not support static `to` overrides in automation step configs).
//
// Usage:
//   source ~/.claude/thrivespan.env && node scripts/build-warm-nurture.mjs

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = "Juli <team@thrivespancollective.com>";
const EVENT_NAME = "warm.added";

if (!RESEND_KEY) {
  console.error("RESEND_API_KEY not set. Run: source ~/.claude/thrivespan.env");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// API helper
// ---------------------------------------------------------------------------
async function resend(method, path, body) {
  const res = await fetch(`https://api.resend.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
      "User-Agent": "ThriveSpan-Build/1.0",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(`Resend ${method} ${path} → ${res.status}: ${text.slice(0, 400)}`);
  return json;
}

// ---------------------------------------------------------------------------
// Shared footer blocks (verbatim from approved source)
// ---------------------------------------------------------------------------
const SHARED_HTML = `<p>Join the #QueenagerMovement<br>👑 Faster. Stronger. Sexier. Harder to Kill.</p>
<p>Love,<br>Juls</p>
<p>Socialize with us:<br>Instagram → <a href="https://instagram.com/thrivespancollective">instagram.com/thrivespancollective</a><br>Facebook → <a href="https://facebook.com/thrivespancollective">facebook.com/thrivespancollective</a><br>Everything → <a href="https://linktr.ee/thrivespancollective">linktr.ee/thrivespancollective</a></p>
<p>ThriveSpan Collective · 1115 Kinney Ave · Austin, TX 78704</p>`;

const SHARED_TEXT = `Join the #QueenagerMovement
👑 Faster. Stronger. Sexier. Harder to Kill.

Love,
Juls

Socialize with us:
Instagram → instagram.com/thrivespancollective
Facebook → facebook.com/thrivespancollective
Everything → linktr.ee/thrivespancollective

ThriveSpan Collective · 1115 Kinney Ave · Austin, TX 78704`;

function preheader(text) {
  return `<span style="display:none;font-size:1px;color:#ffffff;max-height:0;overflow:hidden">${text}</span>`;
}

// ---------------------------------------------------------------------------
// 5 email templates — verbatim from WarmReintro_APPROVED_Resend_2026-07-01.md
// ---------------------------------------------------------------------------
const TEMPLATES = [

  // BEAT 1 — Day 0
  {
    alias: "warm-beat1-reintroduce",
    name: "Warm B1 — Let me reintroduce myself",
    subject: "Let me reintroduce myself.",
    html: `${preheader("Some things are working. Some things aren't. Here's what I did about it.")}
<p>Hi {{{FIRST_NAME}}},</p>
<p>It's Juls — I wanted to reach out directly. I've been heads-down building something that puts my gifts and passion into the world, and you're someone I want in the room.</p>
<p>The short version of how I got here:</p>
<p>At 42 I was an elite triathlete who suddenly couldn't sleep, couldn't recover, couldn't recognize my own body. It took me 12 years to figure out the new playbook. I built ThriveSpan so women don't have to spend 12 years figuring it out alone.</p>
<p>Here's what I keep seeing in women 45+: some things are working. Some things aren't. And the wellness world's answer is always do more, try harder, want it more. You don't need a transformation. You need a playbook: Your Queen Playbook.</p>
<p>That's what ThriveSpan is — a home for Queenagers building strength, energy, and belonging. Structured habit work, real science, and a sisterhood that keeps you at it.</p>
<p>This is the #QueenagerMovement — and you're invited in.</p>
<p>Take the Realm Code. It's a free 3-minute diagnostic that names the Realm you're living in right now — the environment that was never built for your real life — and your first move to redesign it, with intention.</p>
<p>Find your Realm → <a href="https://realm.thrivespancollective.com">realm.thrivespancollective.com</a></p>
${SHARED_HTML}`,
    text: `Hi {{{FIRST_NAME}}},

It's Juls — I wanted to reach out directly. I've been heads-down building something that puts my gifts and passion into the world, and you're someone I want in the room.

The short version of how I got here:

At 42 I was an elite triathlete who suddenly couldn't sleep, couldn't recover, couldn't recognize my own body. It took me 12 years to figure out the new playbook. I built ThriveSpan so women don't have to spend 12 years figuring it out alone.

Here's what I keep seeing in women 45+: some things are working. Some things aren't. And the wellness world's answer is always do more, try harder, want it more. You don't need a transformation. You need a playbook: Your Queen Playbook.

That's what ThriveSpan is — a home for Queenagers building strength, energy, and belonging. Structured habit work, real science, and a sisterhood that keeps you at it.

This is the #QueenagerMovement — and you're invited in.

Take the Realm Code. It's a free 3-minute diagnostic that names the Realm you're living in right now — the environment that was never built for your real life — and your first move to redesign it, with intention.

Find your Realm → realm.thrivespancollective.com

${SHARED_TEXT}`,
  },

  // BEAT 2 — Day 5
  {
    alias: "warm-beat2-system-changed",
    name: "Warm B2 — System changed, no one told you",
    subject: "The system changed and no one told you.",
    html: `${preheader("You're not broken. The playbook changed — and we build yours together.")}
<p>Hi {{{FIRST_NAME}}},</p>
<p>You're not broken. The playbook changed.</p>
<p>And here's the part that feels amazing: we can create YOUR Queen Playbook — the one that works in your real life.</p>
<p>Our clients aren't doing bootcamps, starving, and buying a stack of hacks to sleep. We come together, use ThriveSpan's structure, and figure out how to execute. Not in theory. In your life.</p>
<p>So we don't have to try harder, do more, and feel shame. It was never willpower.</p>
<p>Action &gt; Information. Less Knowing. More Doing.</p>
<p>Start with the Realm Code → <a href="https://realm.thrivespancollective.com">realm.thrivespancollective.com</a></p>
${SHARED_HTML}`,
    text: `Hi {{{FIRST_NAME}}},

You're not broken. The playbook changed.

And here's the part that feels amazing: we can create YOUR Queen Playbook — the one that works in your real life.

Our clients aren't doing bootcamps, starving, and buying a stack of hacks to sleep. We come together, use ThriveSpan's structure, and figure out how to execute. Not in theory. In your life.

So we don't have to try harder, do more, and feel shame. It was never willpower.

Action > Information. Less Knowing. More Doing.

Start with the Realm Code → realm.thrivespancollective.com

${SHARED_TEXT}`,
  },

  // BEAT 3 — Day 12
  {
    alias: "warm-beat3-what-changes",
    name: "Warm B3 — What changes with the playbook",
    subject: "What changes when you have the playbook.",
    html: `${preheader("You stop white-knuckling it. You start trusting yourself again. Here's what that looks like.")}
<p>Hi {{{FIRST_NAME}}},</p>
<p>When you stop white-knuckling wellness and start running a playbook built for the body you have now, three things change.</p>
<p>You stop collecting. No more bookmarked protocols, no more 30-day resets that leave you more depleted than when you started. One habit at a time, built on your environment instead of your willpower.</p>
<p>You stop negotiating with yourself. The habits move into a routine because they fit your real life, they're built using sound strategies, and the results feel amazing. You're no longer starting over, forcing, and trying harder.</p>
<p>You stop doing it alone. The women around you reflect back who you are: someone who Thrives. Someone who lives with intention. Someone who is calm and grounded. Someone who trains and nourishes her body. Someone who trusts herself.</p>
<p>That's the whole model. One habit. Built for now. A sisterhood that keeps you at it.</p>
<p>If you want to see how it works first, start with the Masterclass — "Less Knowing. More Doing." ($39, on-demand, about an hour). It gives you the four-pillar lens and your first move.</p>
<p>Watch the Masterclass → <a href="https://thrivespanmasterclass.carrd.co">thrivespanmasterclass.carrd.co</a></p>
${SHARED_HTML}`,
    text: `Hi {{{FIRST_NAME}}},

When you stop white-knuckling wellness and start running a playbook built for the body you have now, three things change.

You stop collecting. No more bookmarked protocols, no more 30-day resets that leave you more depleted than when you started. One habit at a time, built on your environment instead of your willpower.

You stop negotiating with yourself. The habits move into a routine because they fit your real life, they're built using sound strategies, and the results feel amazing. You're no longer starting over, forcing, and trying harder.

You stop doing it alone. The women around you reflect back who you are: someone who Thrives. Someone who lives with intention. Someone who is calm and grounded. Someone who trains and nourishes her body. Someone who trusts herself.

That's the whole model. One habit. Built for now. A sisterhood that keeps you at it.

If you want to see how it works first, start with the Masterclass — "Less Knowing. More Doing." ($39, on-demand, about an hour). It gives you the four-pillar lens and your first move.

Watch the Masterclass → thrivespanmasterclass.carrd.co

${SHARED_TEXT}`,
  },

  // BEAT 4 — Day 20  (P.S. after shared block, per approved source)
  {
    alias: "warm-beat4-not-alone",
    name: "Warm B4 — Not meant to do this alone",
    subject: "You're not meant to do this alone.",
    html: `${preheader("Sisterhood isn't decoration. It's the intervention. Come in.")}
<p>Hi {{{FIRST_NAME}}},</p>
<p>One more thought, then I'll take a proverbial breath.</p>
<p>Of everything I've learned in 12 years, this is the one I underestimated longest: you're not meant to do this alone.</p>
<p>Sisterhood isn't decoration. It's the intervention. The women who call you forward to who you're becoming — that's what turns a good intention into an identity. A woman who believes she's "not a gym person" quits the gym every time. A woman surrounded by women who train becomes someone who trains. A woman who talks about the challenge of staying calm and grounded with peers who get it — who understand being in the middle of parenting and caring for parents — goes forward with confidence, putting herself first.</p>
<p>That's what ThriveSpan is built to be: a home for Queenagers, where the structure, the science, and the sisterhood live in one place.</p>
${SHARED_HTML}
<p>P.S. When you want the closest step in — Create Your Realm. It's the live lab where you build the environment your real life actually needs, in a room of Queenagers doing the same. → <a href="https://thrivespanrealm.carrd.co">thrivespanrealm.carrd.co</a></p>`,
    text: `Hi {{{FIRST_NAME}}},

One more thought, then I'll take a proverbial breath.

Of everything I've learned in 12 years, this is the one I underestimated longest: you're not meant to do this alone.

Sisterhood isn't decoration. It's the intervention. The women who call you forward to who you're becoming — that's what turns a good intention into an identity. A woman who believes she's "not a gym person" quits the gym every time. A woman surrounded by women who train becomes someone who trains. A woman who talks about the challenge of staying calm and grounded with peers who get it — who understand being in the middle of parenting and caring for parents — goes forward with confidence, putting herself first.

That's what ThriveSpan is built to be: a home for Queenagers, where the structure, the science, and the sisterhood live in one place.

${SHARED_TEXT}

P.S. When you want the closest step in — Create Your Realm. It's the live lab where you build the environment your real life actually needs, in a room of Queenagers doing the same. → thrivespanrealm.carrd.co`,
  },

  // BEAT 5 — Day 27
  {
    alias: "warm-beat5-not-going-anywhere",
    name: "Warm B5 — I'm not going anywhere",
    subject: "I'm not going anywhere.",
    html: `${preheader("The emails settle down after this. The relationship doesn't.")}
<p>Hi {{{FIRST_NAME}}},</p>
<p>This is the last email in this welcome series — and it's a beginning, not an ending. From here, you're in The Reign with me, where I keep showing up all year: written notes, the occasional video, and personal invitations to what's happening inside ThriveSpan — including the occasional free pass in before you ever join. Nothing goes quiet. I'm still here, and the room stays open.</p>
<p>What I'm building isn't a campaign or a course launch. It's a movement I expect to be running for the next 30 years. The women I want in the room for that are the ones already paying attention. That's you.</p>
<p>The easiest way to stay in this conversation is to follow along on Instagram and Facebook. That's where I show up every day — the thoughts, the training, the real talk about what it means to thrive in this chapter.</p>
<p>Instagram → <a href="https://instagram.com/thrivespancollective">instagram.com/thrivespancollective</a><br>Facebook → <a href="https://facebook.com/thrivespancollective">facebook.com/thrivespancollective</a></p>
<p>Building, showing up, staying in the room — that's what I do. I'm glad you've been in this with me.</p>
${SHARED_HTML}`,
    text: `Hi {{{FIRST_NAME}}},

This is the last email in this welcome series — and it's a beginning, not an ending. From here, you're in The Reign with me, where I keep showing up all year: written notes, the occasional video, and personal invitations to what's happening inside ThriveSpan — including the occasional free pass in before you ever join. Nothing goes quiet. I'm still here, and the room stays open.

What I'm building isn't a campaign or a course launch. It's a movement I expect to be running for the next 30 years. The women I want in the room for that are the ones already paying attention. That's you.

The easiest way to stay in this conversation is to follow along on Instagram and Facebook. That's where I show up every day — the thoughts, the training, the real talk about what it means to thrive in this chapter.

Instagram → instagram.com/thrivespancollective
Facebook → facebook.com/thrivespancollective

Building, showing up, staying in the room — that's what I do. I'm glad you've been in this with me.

${SHARED_TEXT}`,
  },
];

// ---------------------------------------------------------------------------
// Main build
// ---------------------------------------------------------------------------
async function main() {
  console.log("=== Building Warm Re-Intro Nurture in Resend ===\n");

  // 1. Verify warm.added event exists (was created earlier; idempotent)
  console.log("Step 1: Check warm.added event...");
  const existing = await resend("GET", "/events");
  const found = existing.data?.find(e => e.name === EVENT_NAME);
  if (!found) {
    const ev = await resend("POST", "/events", { name: EVENT_NAME });
    console.log(`  Created event: warm.added (id ${ev.id})\n`);
  } else {
    console.log(`  Event warm.added confirmed (id ${found.id})\n`);
  }

  // 2. Create + publish 5 email templates
  console.log("Step 2: Create and publish 5 email templates...");
  const templateIds = {};

  for (const tpl of TEMPLATES) {
    const created = await resend("POST", "/templates", {
      name: tpl.name,
      alias: tpl.alias,
      from: FROM,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });
    console.log(`  Created:   ${tpl.alias} → ${created.id}`);

    await resend("POST", `/templates/${created.id}/publish`, {});
    console.log(`  Published: ${tpl.alias}`);

    templateIds[tpl.alias] = created.id;
  }

  // 3. Build automation (10 steps: trigger + 5 emails + 4 delays)
  // Timeline: Beat1 Day0 → +5d → Beat2 Day5 → +7d → Beat3 Day12
  //           → +8d → Beat4 Day20 → +7d → Beat5 Day27
  console.log("\nStep 3: Build automation...");

  const steps = [
    { key: "start",   type: "trigger",    config: { event_name: EVENT_NAME } },
    { key: "beat1",   type: "send_email", config: { template: { id: templateIds["warm-beat1-reintroduce"] } } },
    { key: "d1",      type: "delay",      config: { duration: "5 days" } },
    { key: "beat2",   type: "send_email", config: { template: { id: templateIds["warm-beat2-system-changed"] } } },
    { key: "d2",      type: "delay",      config: { duration: "7 days" } },
    { key: "beat3",   type: "send_email", config: { template: { id: templateIds["warm-beat3-what-changes"] } } },
    { key: "d3",      type: "delay",      config: { duration: "8 days" } },
    { key: "beat4",   type: "send_email", config: { template: { id: templateIds["warm-beat4-not-alone"] } } },
    { key: "d4",      type: "delay",      config: { duration: "7 days" } },
    { key: "beat5",   type: "send_email", config: { template: { id: templateIds["warm-beat5-not-going-anywhere"] } } },
  ];

  const connections = [
    { from: "start",  to: "beat1",  type: "default" },
    { from: "beat1",  to: "d1",     type: "default" },
    { from: "d1",     to: "beat2",  type: "default" },
    { from: "beat2",  to: "d2",     type: "default" },
    { from: "d2",     to: "beat3",  type: "default" },
    { from: "beat3",  to: "d3",     type: "default" },
    { from: "d3",     to: "beat4",  type: "default" },
    { from: "beat4",  to: "d4",     type: "default" },
    { from: "d4",     to: "beat5",  type: "default" },
  ];

  const automation = await resend("POST", "/automations", {
    name: "Warm Re-Intro Nurture",
    steps,
    connections,
  });
  console.log(`  Created: Warm Re-Intro Nurture (id ${automation.id})`);

  await resend("PATCH", `/automations/${automation.id}`, { status: "enabled" });
  console.log(`  Enabled automation\n`);

  console.log("=== BUILD COMPLETE ===");
  console.log(`\nAutomation ID: ${automation.id}`);
  console.log("\nTemplate IDs:");
  for (const [alias, id] of Object.entries(templateIds)) {
    console.log(`  ${alias}: ${id}`);
  }
  console.log(`\nNext: run the test`);
  console.log(`  source ~/.claude/thrivespan.env && /Applications/Codex.app/Contents/Resources/node scripts/add-warm-contact.mjs "JAM Performance" "jamperformancellc@gmail.com"`);
}

main().catch(err => {
  console.error("\n❌ Build failed:", err.message);
  process.exit(1);
});
