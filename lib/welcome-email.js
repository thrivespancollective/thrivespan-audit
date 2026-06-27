// Welcome email template — fires immediately after audit submit.
// Pulls the same content the user just saw on screen, formatted for inbox.
// Per Option C launch decision (2026-06-06): full Code Reading in their inbox,
// no PDF, no recording — substantive text version of the results page + CTA.
// Voice rebuild 2026-06-25: collapsed to 4 beats (What's working / Where your
// room is / Your one move / Next step). Integration + Re-Anchor + Cascade cut
// from the readout — see results.js PARKED section.

import {
  ANCHOR_COPY,
  EDGE_COPY,
  LEVERAGE_PLAYS,
  CTA_COPY,
} from "./results.js";
import { matchCombo } from "./scoring.js";

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

const BRAND = {
  cream: "#FAF6F0",
  ink: "#0E0E10",
  gold: "#C9A55C",
  charcoal: "#1A1A1F",
};

// Build the email subject + html + text given the audit result payload.
export function buildWelcomeEmail({ firstName, scoreResult, route }) {
  const anchor = scoreResult?.anchor || "move";
  const edge = scoreResult?.edge || "restore";
  const composite = scoreResult?.composite ?? 0;

  const anchorCopy = ANCHOR_COPY[anchor] || ANCHOR_COPY.move;
  const edgeCopy = EDGE_COPY[edge] || EDGE_COPY.restore;
  const move = matchCombo(anchor, edge, LEVERAGE_PLAYS);
  const cta = CTA_COPY[route] || CTA_COPY.masterclass;

  const codeTag = `${cap(anchor)}-Anchor · ${cap(edge)}-Lever`;
  const subject = `Your Queenager Code: ${codeTag}`;

  const text = buildTextEmail({ firstName, codeTag, composite, anchorCopy, edgeCopy, move, cta });
  const html = buildHtmlEmail({ firstName, codeTag, composite, anchorCopy, edgeCopy, move, cta });

  return { subject, text, html };
}

function buildTextEmail({ firstName, codeTag, composite, anchorCopy, edgeCopy, move, cta }) {
  return `${firstName} —

Here's your Queenager Code reading.

YOUR CODE: ${codeTag}
Thrive Score: ${composite} / 80

────────────────────────────────────────

WHAT'S WORKING FOR YOU
${anchorCopy.headline}

${anchorCopy.body}

────────────────────────────────────────

WHERE A BIT OF CHANGE YIELDS BIG RESULTS
${edgeCopy.headline}

${edgeCopy.body}

THE CHANGE TO MAKE THIS WEEK — ${move.headline}
${move.body}

────────────────────────────────────────

YOUR NEXT STEP
${cta.headline}

${cta.body}

${cta.details}

→ ${cta.button}: ${cta.href}

────────────────────────────────────────

This is your starting map. The Queen Playbook is what you build next — inside The Build.

Faster. Stronger. Sexier. Harder to Kill.
👑

— Juli
ThriveSpan Collective
https://linktr.ee/thrivespancollective
`;
}

function buildHtmlEmail({ firstName, codeTag, composite, anchorCopy, edgeCopy, move, cta }) {
  const c = BRAND;
  const block = (label, headline, body) => `
    <tr><td style="padding:24px 0 8px 0;">
      <div style="color:${c.gold};font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Helvetica,Arial,sans-serif;">${label}</div>
    </td></tr>
    <tr><td style="padding:0 0 8px 0;">
      <h2 style="margin:0;color:${c.cream};font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:22px;font-weight:normal;">${headline}</h2>
    </td></tr>
    <tr><td style="padding:0 0 16px 0;">
      <div style="color:#D8D2C5;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;">${body}</div>
    </td></tr>
  `;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${c.ink};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${c.ink};">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;">

        <tr><td style="padding:0 0 20px 0;text-align:center;">
          <div style="color:${c.gold};font-style:italic;font-family:Georgia,'Times New Roman',serif;font-size:14px;">${firstName ? firstName + " —" : "—"}</div>
          <h1 style="margin:8px 0 0 0;color:${c.cream};font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:normal;">Here's your Queenager Code reading.</h1>
        </td></tr>

        <tr><td align="center" style="padding:24px 0;">
          <div style="color:rgba(250,246,240,0.6);font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-family:Helvetica,Arial,sans-serif;margin-bottom:8px;">Your Thrive Score</div>
          <div style="color:${c.gold};font-family:Georgia,'Times New Roman',serif;font-size:60px;font-weight:normal;line-height:1;">${composite} <span style="color:rgba(250,246,240,0.5);font-size:30px;">/ 80</span></div>
          <div style="display:inline-block;margin-top:20px;border:1px solid rgba(201,165,92,0.4);border-radius:2px;padding:14px 22px;background:${c.charcoal};">
            <div style="color:rgba(250,246,240,0.5);font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Helvetica,Arial,sans-serif;margin-bottom:4px;">Your Code</div>
            <div style="color:${c.gold};font-family:Georgia,'Times New Roman',serif;font-size:20px;">${codeTag}</div>
          </div>
        </td></tr>

        <tr><td style="border-top:1px solid rgba(201,165,92,0.2);"></td></tr>

        ${block("What's working for you", anchorCopy.headline, escapeHtml(anchorCopy.body))}

        <tr><td style="border-top:1px solid rgba(201,165,92,0.2);"></td></tr>

        ${block("Where a bit of change yields big results", edgeCopy.headline,
          `<p style="margin:0 0 16px 0;">${escapeHtml(edgeCopy.body)}</p>
           <div style="border-left:2px solid ${c.gold};padding-left:14px;">
             <div style="color:${c.gold};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-family:Helvetica,Arial,sans-serif;margin-bottom:6px;">The change to make this week</div>
             <p style="margin:0 0 6px 0;color:${c.cream};font-style:italic;">${escapeHtml(move.headline)}</p>
             <p style="margin:0;">${escapeHtml(move.body)}</p>
           </div>`
        )}

        <tr><td style="border-top:1px solid rgba(201,165,92,0.2);"></td></tr>

        <tr><td align="center" style="padding:32px 0 16px 0;">
          <div style="color:${c.gold};font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Helvetica,Arial,sans-serif;margin-bottom:8px;">Your Next Step</div>
          <h2 style="margin:0 0 12px 0;color:${c.cream};font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:normal;">${escapeHtml(cta.headline)}</h2>
          <p style="margin:0 0 16px 0;color:#D8D2C5;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;max-width:480px;">${escapeHtml(cta.body)}</p>
          <p style="margin:0 0 24px 0;color:rgba(250,246,240,0.65);font-family:Helvetica,Arial,sans-serif;font-size:13px;">${escapeHtml(cta.details)}</p>
          <a href="${cta.href}" style="display:inline-block;background:${c.cream};color:${c.ink};text-decoration:none;padding:14px 28px;border-radius:2px;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:500;">${escapeHtml(cta.button)} →</a>
        </td></tr>

        <tr><td align="center" style="padding:32px 0 16px 0;border-top:1px solid rgba(201,165,92,0.2);">
          <p style="margin:0;color:rgba(250,246,240,0.6);font-family:Helvetica,Arial,sans-serif;font-size:13px;font-style:italic;line-height:1.6;">This is your starting map. The Queen Playbook is what you build next — inside The Build.</p>
        </td></tr>

        <tr><td align="center" style="padding:16px 0;">
          <p style="margin:0;color:${c.gold};font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:1px;">👑 Faster. Stronger. Sexier. Harder to Kill.</p>
        </td></tr>

        <tr><td align="center" style="padding:24px 0 0 0;">
          <p style="margin:0;color:rgba(250,246,240,0.6);font-family:Helvetica,Arial,sans-serif;font-size:13px;">— Juli</p>
          <p style="margin:4px 0 0 0;color:rgba(250,246,240,0.5);font-family:Helvetica,Arial,sans-serif;font-size:12px;">
            <a href="https://linktr.ee/thrivespancollective" style="color:${c.gold};text-decoration:none;">ThriveSpan Collective</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
