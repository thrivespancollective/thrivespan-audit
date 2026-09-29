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
  const lift = [setup.lift_movement, setup.lift_load].filter(Boolean).join(", ");
  if (lift) lines.push(`Lift: ${lift}`);
  if (setup.bc_instrument) lines.push(`Body composition: ${setup.bc_instrument}`);
  if (setup.vo2_source) lines.push(`VO2max: ${setup.vo2_source}`);
  return lines;
}

// Week 10 — the slow clock needs a head start.
export function sendBookSlowSet({ to, name, move }) {
  const text = [
    `${name || "Queen"},`,
    "",
    "Your next numbers are two weeks out. Book the slow set now so the results are back in time: the bloodwork, the DEXA, the VO2max.",
    "",
    "Already going in for bloodwork? The whole ask is one sentence: add ApoB and A1C.",
    move ? `\nYour move last time: ${move}` : null,
    "",
    FORWARD_URL,
    "",
    "Juls",
    "Faster. Stronger. Sexier. Harder to Kill.",
  ]
    .filter((l) => l !== null)
    .join("\n");
  return send({ to, subject: "Two weeks out: book the slow set", text });
}

// Week 12 — capture day.
export function sendCaptureDay({ to, name, move, setup }) {
  const lines = setupLines(setup);
  const text = [
    `${name || "Queen"},`,
    "",
    "Twelve weeks since your last numbers. This week, run the same tests.",
    lines.length ? `\nSame as last time:\n${lines.join("\n")}` : null,
    move ? `\nYour move last time: ${move}` : null,
    "",
    "Log what you have. Leave blank anything you don't have yet.",
    FORWARD_URL,
    "",
    "Juls",
    "Faster. Stronger. Sexier. Harder to Kill.",
  ]
    .filter((l) => l !== null)
    .join("\n");
  return send({ to, subject: "Twelve weeks: your numbers", text });
}
