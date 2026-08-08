// ============================================================================
// THE RESULTS EMAIL — "It's Not Discipline"
// ============================================================================
// Fires immediately after submit. She sees her result on screen AND gets it
// here — no teaser-gating, no withholding. She answered honestly; she gets the
// answer. (Rebuilt 2026-08-05 from the Queenager Code welcome email.)
//
// Subject = her blocker. Highest-open subject we can write, because it's about
// her and it's the thing she just asked to find out.
//
// Four beats: the result · the mirror · the move · the room.
// Copy is single-sourced from lib/blockers.js so the email and the screen can
// never drift apart.
// ============================================================================

import { BLOCKER_COPY, RESULT_CTA } from "./blockers.js";

// The Crown Standard — Helios → _Core/TeamQueen_Visual_Identity.md
const BRAND = {
  cream: "#FAF7F2", // Ivory Silk — the ground
  plum: "#3C1D3F", // Queen Plum — primary
  gold: "#CDB15B", // Champagne Gold — ACCENT ONLY, never a fill
  charcoal: "#1A1A1A", // Charcoal Ink — body text, never pure black
};

// The Your First Win room page. Live 2026-08-06.
const ROOM_URL = "https://teamqueenyourfirstwin.carrd.co/";

// The Sprint — the P.S. offer. This email is the single highest-intent moment
// in the funnel (she just asked to be diagnosed and got an answer), and until
// now it sold nothing. The P.S. is deliberate: it never competes with the room
// CTA above it, it just gives the woman who wants speed somewhere to go.
// (Melissa Henault's own move — "in the P.S., jump to the front of the line.")
const SPRINT_URL = "https://thrivespancollective.circle.so/checkout/sprint";
const SPRINT_PS = {
  lead: "P.S. One hour not enough?",
  body:
    "You've never doubted you could do it once. The Sprint is five days in a row \u2014 Monday to Friday, 45 minutes \u2014 because five is where \u201cI did it\u201d turns into \u201cthis is who I am.\u201d 30 days on TeamQueen comes with it.",
  cta: "Take the Sprint",
};

export function buildWelcomeEmail({ firstName, scoreResult }) {
  const blocker = scoreResult?.blocker || "unguarded";
  const copy = BLOCKER_COPY[blocker] || BLOCKER_COPY.unguarded;

  const subject = copy.subject;
  const text = buildTextEmail({ firstName, copy });
  const html = buildHtmlEmail({ firstName, copy });

  return { subject, text, html };
}

function buildTextEmail({ firstName, copy }) {
  return `${firstName || "Hi"} —

${copy.name.toUpperCase()}

${copy.mirror.join("\n\n")}

DO THIS NOW
${copy.move}

—

${RESULT_CTA.lead}

${copy.promise}

${RESULT_CTA.offer}
${RESULT_CTA.times}

Pick your Monday: ${ROOM_URL}

${RESULT_CTA.signoff}
#forward

—

${SPRINT_PS.lead}
${SPRINT_PS.body}
${SPRINT_URL}
`;
}

function buildHtmlEmail({ firstName, copy }) {
  const mirror = copy.mirror
    .map(
      (line, i) =>
        `<p style="margin:0 0 18px;font-size:17px;line-height:1.65;color:${
          BRAND.charcoal
        };${i === copy.mirror.length - 1 ? "font-weight:600;" : ""}">${escapeHtml(
          line
        )}</p>`
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:${BRAND.cream};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

  <tr><td style="padding-bottom:28px;">
    <p style="margin:0;font-size:15px;color:${BRAND.gold};font-style:italic;">${escapeHtml(
    firstName || ""
  )} —</p>
  </td></tr>

  <tr><td style="padding-bottom:24px;">
    <p style="margin:0 0 6px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8a8a8a;">Here's what's in your way</p>
    <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.2;color:${
      BRAND.plum
    };">${escapeHtml(copy.name)}</h1>
  </td></tr>

  <tr><td style="padding-bottom:12px;">${mirror}</td></tr>

  <tr><td style="padding:22px 24px;border:1px solid ${
    BRAND.gold
  };border-radius:2px;margin-bottom:28px;">
    <p style="margin:0 0 10px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8a8a8a;">Do this now</p>
    <p style="margin:0;font-size:17px;line-height:1.6;color:${
      BRAND.charcoal
    };">${escapeHtml(copy.move)}</p>
  </td></tr>

  <tr><td style="padding-top:36px;text-align:center;">
    <p style="margin:0 0 14px;font-family:Georgia,serif;font-size:22px;color:${
      BRAND.plum
    };">${escapeHtml(RESULT_CTA.lead)}</p>
    <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:${
      BRAND.charcoal
    };">${escapeHtml(copy.promise)}</p>
    <p style="margin:0 0 4px;font-size:16px;color:${BRAND.charcoal};">${escapeHtml(
    RESULT_CTA.offer
  )}</p>
    <p style="margin:0 0 24px;font-size:14px;letter-spacing:.04em;color:${
      BRAND.gold
    };">${escapeHtml(RESULT_CTA.times)}</p>
    <a href="${ROOM_URL}" style="display:inline-block;padding:14px 34px;border:1px solid ${
    BRAND.gold
  };border-radius:2px;color:${
    BRAND.plum
  };text-decoration:none;font-size:15px;letter-spacing:.04em;">${escapeHtml(
    RESULT_CTA.cta
  )}</a>
  </td></tr>

  <tr><td style="padding-top:40px;text-align:center;">
    <p style="margin:0;font-size:15px;font-style:italic;color:#6a6a6a;white-space:pre-line;">${escapeHtml(
      RESULT_CTA.signoff
    )}</p>
    <p style="margin:14px 0 0;font-size:13px;letter-spacing:.06em;color:${
      BRAND.gold
    };">#forward</p>
  </td></tr>

  <tr><td style="padding-top:38px;">
    <div style="border-top:1px solid #e3ddd2;padding-top:22px;">
      <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:${
        BRAND.plum
      };">${escapeHtml(SPRINT_PS.lead)}</p>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${
        BRAND.charcoal
      };">${escapeHtml(SPRINT_PS.body)}</p>
      <a href="${SPRINT_URL}" style="display:inline-block;padding:11px 26px;background:${
        BRAND.plum
      };border-radius:2px;color:${
        BRAND.cream
      };text-decoration:none;font-size:14px;letter-spacing:.04em;">${escapeHtml(
        SPRINT_PS.cta
      )}</a>
    </div>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
