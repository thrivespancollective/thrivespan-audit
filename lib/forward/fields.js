// FSSH2K Forward — the field set.
// Structure: Juls, 2026-09-29 (the "12 weeks: Reflect & Measure" slide) —
// Faster · Stronger · Sexier · Harder to Kill™ · The Queen · My Picks.
// Help text from Helios → Offers/The_Build/Curriculum/MyNumbers_Form_Spec.md.
//
// clock:   "fast" = she controls it, one week, no booking
//          "slow" = a calendar controls it (labs, DEXA, lab VO2max). Internal only —
//          drives the week-10 "book your labs" email. Never shown as a label.
// kind:    "scale" (1–10) · "number" · "time" (mm:ss) · "text" · "choice"
// trend:   true = plotted and compared over time
// setup:   true = HOW she tests (method, distance, machine, movement, load).
//          Prefilled from last time so she keeps it identical.
// ⛔ Hormones are deliberately NOT here. Canon: retest with your own doctor.

export const HABITS = [
  "Beverages", "Protein", "Meditation", "Strength", "Cardio",
  "Sleep", "Connect", "Stability", "Eat Real Food",
];

export const INTRO =
  "Leave blank anything you don't have yet, or tap N/A. Come back and add the rest when you have it.";

export const CONFIRMATION = [
  "Got it. That's logged.",
  "Still waiting on labs, a DEXA, or a VO2max? Come back and add them when you have them. Submitting twice is how it's supposed to work.",
];

const lift = (side, label) => ({
  title: `My lift · ${label}`,
  help: "Pick one movement and keep it. RPE 7 is about three reps left; RPE 10 is nothing left. Suggested range 7–10. Next time: same movement, same load, same RPE. Then the reps tell the story.",
  fields: [
    { key: `lift_${side}_movement`, label: "Movement", kind: "text", setup: true },
    { key: `lift_${side}_load`, label: "Load", kind: "text", setup: true, placeholder: "lbs, or BW" },
    { key: `lift_${side}_reps`, label: "Reps", kind: "number", trend: true },
    { key: `lift_${side}_rpe`, label: "RPE", kind: "scale" },
  ],
});

export const SECTIONS = [
  {
    id: "faster",
    title: "Faster",
    groups: [
      { fields: [{ key: "energy", label: "Energy", kind: "scale", trend: true }] },
      {
        title: "My pace",
        help: "Any method, any distance. Keep it meaningful to you and identical each time: same route or machine, same resistance, same conditions.",
        fields: [
          { key: "pace_method", label: "Method", kind: "text", setup: true, placeholder: "walk, run, sprint, row, bike, swim, stairs" },
          { key: "pace_distance", label: "Distance", kind: "text", setup: true },
          { key: "pace_where", label: "Where / machine / resistance / incline", kind: "text", setup: true },
          { key: "pace_time", label: "Time", kind: "time", trend: true, placeholder: "mm:ss" },
        ],
      },
      {
        title: "VO2max",
        clock: "slow",
        help: "A lab test, or the estimate your watch reports (Apple Watch calls it Cardio Fitness). Same source every time.",
        fields: [
          { key: "vo2", label: "VO2max", kind: "number", unit: "ml/kg/min", trend: true },
          { key: "vo2_source", label: "Source", kind: "choice", options: ["lab", "watch"], setup: true },
        ],
      },
    ],
  },
  {
    id: "stronger",
    title: "Stronger",
    groups: [
      { fields: [{ key: "strength", label: "Strength", kind: "scale", trend: true }] },
      lift("upper", "upper body"),
      lift("lower", "lower body"),
    ],
  },
  {
    id: "sexier",
    title: "Sexier",
    groups: [
      { fields: [{ key: "naked", label: "Feeling good naked", kind: "scale", trend: true }] },
      {
        title: "Body composition",
        clock: "slow",
        help: "Same instrument every time. A DEXA and a smart scale don't give the same number. Booking a DEXA? Ask for bone density in the same scan, no extra cost.",
        fields: [
          { key: "bc_instrument", label: "Instrument", kind: "choice", options: ["DEXA", "InBody", "scale"], setup: true },
          { key: "bodyfat", label: "Body fat %", kind: "number", unit: "%", trend: true },
          { key: "lean", label: "Lean mass", kind: "number", unit: "lbs", trend: true },
        ],
      },
    ],
  },
  {
    id: "h2k",
    title: "Harder to Kill™",
    groups: [
      {
        title: "Balance",
        help: "One leg, arms free, stand near a counter. Clock stops when your foot touches down or you reach for something.",
        fields: [
          { key: "stance_eo_r", label: "Eyes open, right", kind: "number", unit: "sec", trend: true },
          { key: "stance_eo_l", label: "Eyes open, left", kind: "number", unit: "sec", trend: true },
          { key: "stance_ec_r", label: "Eyes closed, right", kind: "number", unit: "sec", trend: true },
          { key: "stance_ec_l", label: "Eyes closed, left", kind: "number", unit: "sec", trend: true },
        ],
      },
      {
        title: "Blood pressure",
        help: "Any pharmacy cuff. Sitting, feet flat, after five quiet minutes. Take it twice, write the second.",
        fields: [{ key: "bp", label: "Blood pressure", kind: "text", placeholder: "e.g. 118/74" }],
      },
      {
        title: "Bloodwork",
        clock: "slow",
        help: "Already going in for bloodwork? The whole ask is one sentence: add ApoB and A1C.",
        fields: [
          { key: "apob", label: "ApoB", kind: "number", unit: "mg/dL", trend: true },
          { key: "a1c", label: "A1C", kind: "number", unit: "%", trend: true },
        ],
      },
      {
        title: "Bone density",
        clock: "slow",
        fields: [
          { key: "bone_spine", label: "Spine", kind: "text" },
          { key: "bone_hip", label: "Hip", kind: "text" },
        ],
      },
    ],
  },
  {
    id: "queen",
    title: "The Queen",
    groups: [{ fields: [{ key: "confidence", label: "Confidence", kind: "scale", trend: true }] }],
  },
  {
    id: "picks",
    title: "My picks",
    groups: [
      {
        fields: [
          { key: "star", label: "⭐ My Star", hint: "The habit I'm crushing", kind: "choice", options: HABITS, noNA: true },
          { key: "play", label: "🎯 My Play", hint: "The habit I'm refocusing on this week", kind: "choice", options: HABITS, noNA: true },
        ],
      },
    ],
  },
  {
    id: "else",
    title: "Anything else",
    groups: [
      {
        help: "Including what you couldn't book, or a test nobody offered you.",
        fields: [{ key: "notes", label: "What moved, what didn't, what you couldn't get to", kind: "text", long: true, noNA: true }],
      },
    ],
  },
];

export const ALL_FIELDS = SECTIONS.flatMap((s) =>
  s.groups.flatMap((g) =>
    g.fields.map((f) => ({ ...f, section: s.id, sectionTitle: s.title, clock: g.clock || "fast", group: g.title || null }))
  )
);

export const FIELD_BY_KEY = Object.fromEntries(ALL_FIELDS.map((f) => [f.key, f]));
export const TREND_FIELDS = ALL_FIELDS.filter((f) => f.trend);
export const FAST_KEYS = ALL_FIELDS.filter((f) => f.clock === "fast" && !["notes", "star", "play"].includes(f.key)).map((f) => f.key);

// "2:05" → 125 · "1:02:05" → 3725 · "95" → 95
export function parseTime(v) {
  if (v == null || v === "") return null;
  const parts = String(v).trim().split(":").map((p) => Number(p));
  if (!parts.length || parts.some((n) => Number.isNaN(n))) return null;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

export function formatTime(sec) {
  if (sec == null) return "";
  const s = Math.round(Math.abs(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${r}` : `${m}:${r}`;
}

export function numericValue(field, raw) {
  if (raw == null || raw === "") return null;
  if (field.kind === "time") return parseTime(raw);
  const n = parseFloat(String(raw).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

// Keep only known fields, trimmed, capped. Blank = not captured.
export function cleanEntry(input) {
  const out = {};
  for (const f of ALL_FIELDS) {
    const v = input?.[f.key];
    if (v == null) continue;
    const s = String(v).trim().slice(0, f.long ? 2000 : 120);
    if (!s) continue;
    // N/A is an answer, not a blank: she's telling us this one doesn't apply.
    if (s.toUpperCase() === "N/A") {
      out[f.key] = "N/A";
      continue;
    }
    if (f.kind === "scale") {
      const n = Number(s);
      if (!Number.isInteger(n) || n < 1 || n > 10) continue;
      out[f.key] = n;
    } else if (f.kind === "choice") {
      if (f.options.includes(s)) out[f.key] = s;
    } else {
      out[f.key] = s;
    }
  }
  return out;
}

// The last value she gave for each field, across every capture.
// Slow-clock numbers often arrive in a later, partial submission — so
// "latest" is per field, never "the latest entry".
export function latestByField(entries) {
  const out = {};
  for (const e of entries) {
    for (const [k, v] of Object.entries(e.values || {})) out[k] = { value: v, at: e.at };
  }
  return out;
}

// Her test setup from the most recent capture that had one.
export function lastSetup(entries) {
  const latest = latestByField(entries);
  const setup = {};
  for (const f of ALL_FIELDS) if (f.setup && latest[f.key]) setup[f.key] = latest[f.key].value;
  return setup;
}

// Most recent capture with any fast-clock value — the 12-week clock runs from here.
export function lastFastCapture(entries) {
  for (let i = entries.length - 1; i >= 0; i--) {
    const v = entries[i].values || {};
    if (FAST_KEYS.some((k) => v[k] != null && v[k] !== "N/A")) return entries[i];
  }
  return null;
}

// Her last Star and Play — shown back to her so she knows what she picked.
export function lastPicks(entries) {
  const out = {};
  for (let i = entries.length - 1; i >= 0; i--) {
    const v = entries[i].values || {};
    if (!out.star && v.star && v.star !== "N/A") out.star = { value: v.star, at: entries[i].at };
    if (!out.play && v.play && v.play !== "N/A") out.play = { value: v.play, at: entries[i].at };
  }
  return out;
}

// For one group: what she did last time and what she got, from the most
// recent capture that had any of this group's fields.
export function lastTimeFor(group, entries) {
  const keys = group.fields.map((f) => f.key);
  for (let i = entries.length - 1; i >= 0; i--) {
    const v = entries[i].values || {};
    const hit = keys.filter((k) => v[k] != null && v[k] !== "");
    if (hit.length) {
      return {
        at: entries[i].at,
        parts: group.fields
          .filter((f) => v[f.key] != null && v[f.key] !== "")
          .map((f) => ({ label: f.label, value: v[f.key], unit: f.unit, kind: f.kind })),
      };
    }
  }
  return null;
}
