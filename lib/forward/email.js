// FSSH2K Forward — the three emails, via Resend.
// ⭐ The page and these emails remind her. Never Juls — a per-person chase scales with N.
const FROM = process.env.RESEND_FROM || "Juls <team@teamqueen.co>";
export const FORWARD_URL = process.env.FORWARD_URL || "https://start.teamqueen.co/forward";

async function send({ to, subject, text }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("[forward-email] RESEND_API_KEY not set, skipping:", subject);
    return { ok: false, skipped: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], subject, text }),
  });
  if (!res.ok) {
    console.warn("[forward-email] failed", res.status, await res.text());
    return { ok: false, status: res.status };
  }
  return { ok: true };
}

export function sendCode(to, code) {
  return send({
    to,
    subject: `${code} is your FSSH2K Forward code`,
    text: `Your code: ${code}\n\nIt expires in 15 minutes.\n\nFaster. Stronger. Sexier. Harder to Kill.`,
  });
}

// Her test, written back to her so she keeps it identical.
export function setupLines(setup) {
  const lines = [];
  const pace = [setup.pace_method, setup.pace_distance, setup.pace_where].filter(Boolean).join(", ");
  if (pace) lines.push(`Pace: ${pace}`);
  const upper = [setup.lift_upper_movement, setup.lift_upper_load].filter(Boolean).join(", ");
  if (upper) lines.push(`Upper-body lift: ${upper}`);
  const lower = [setup.lift_lower_movement, setup.lift_lower_load].filter(Boolean).join(", ");
  if (lower) lines.push(`Lower-body lift: ${lower}`);
  if (setup.bc_instrument) lines.push(`Body composition: ${setup.bc_instrument}`);
  if (setup.vo2_source) lines.push(`VO2max: ${setup.vo2_source}`);
  return lines;
}

// Two weeks before a Measure Week — labs need a head start.
export function sendBookLabs({ to, name, play }) {
  const text = [
    `${name || "Queen"},`,
    "",
    "Measure Week is two weeks out. Book your bloodwork, DEXA and VO2max now so the results are back in time.",
    "",
    "Already going in for bloodwork? The whole ask is one sentence: add ApoB and A1C.",
    play ? `\nYour Play last time: ${play}` : null,
    "",
    FORWARD_URL,
    "",
    "Juls",
    "Faster. Stronger. Sexier. Harder to Kill.",
  ]
    .filter((l) => l !== null)
    .join("\n");
  return send({ to, subject: "Measure Week is two weeks out: book your labs", text });
}

// The Monday of a Measure Week.
export function sendCaptureDay({ to, name, play, setup }) {
  const lines = setupLines(setup);
  const text = [
    `${name || "Queen"},`,
    "",
    "It's Measure Week. Run the same tests and log what you have.",
    lines.length ? `\nSame as last time:\n${lines.join("\n")}` : null,
    play ? `\nYour Play last time: ${play}` : null,
    "",
    "Leave blank anything you don't have yet, or tap N/A.",
    FORWARD_URL,
    "",
    "Juls",
    "Faster. Stronger. Sexier. Harder to Kill.",
  ]
    .filter((l) => l !== null)
    .join("\n");
  return send({ to, subject: "It's Measure Week", text });
}
