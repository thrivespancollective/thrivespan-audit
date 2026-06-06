// Welcome email template — fires immediately after audit submit.
// Pulls the same content the user just saw on screen, formatted for inbox.
// Per Option C launch decision (2026-06-06): full Code Reading in their inbox,
// no PDF, no recording — substantive text version of the results page + CTA.

import {
  ANCHOR_COPY,
  EDGE_COPY,
  INTEGRATION_COPY,
  LEVERAGE_PLAYS,
  REANCHOR_ROUTINES,
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
export function buildWelcomeEmail({ firstName, scoreResult, route, metaAnswers, arcStage }) {
  const anchor = scoreResult?.anchor || "move";
  const edge = scoreResult?.edge || "restore";
  const composite = scoreResult?.composite ?? 0;
  const cascadeTrigger = metaAnswers?.meta_edge;

  const anchorCopy = ANCHOR_COPY[anchor] || ANCHOR_COPY.move;
  const edgeCopy = EDGE_COPY[edge] || EDGE_COPY.restore;
  const integration = matchCombo(anchor, edge, INTEGRATION_COPY);
  const leverage = matchCombo(anchor, edge, LEVERAGE_PLAYS);
  const reanchor = matchCombo(anchor, edge, REANCHOR_ROUTINES);
  const cta = CTA_COPY[route] || CTA_COPY.masterclass;

  const codeTag = `${cap(anchor)}-Anchor · ${cap(edge)}-Lever`;
  const cascadeBlock = buildCascadeBlock(cascadeTrigger, edge);

  const subject = `Your Queenager Code: ${codeTag}`;

  const text = buildTextEmail({
    firstName,
    codeTag,
    composite,
    anchorCopy,
    edgeCopy,
    cascadeBlock,
    integration,
    leverage,
    reanchor,
    cta,
  });

  const html = buildHtmlEmail({
    firstName,
    codeTag,
    composite,
    anchorCopy,
    edgeCopy,
    cascadeBlock,
    integration,
    leverage,
    reanchor,
    cta,
  });

  return { subject, text, html };
}

function buildCascadeBlock(cascadeTrigger, scoredEdge) {
  if (!cascadeTrigger) return null;
  if (cascadeTrigger === "not_sure") {
    return {
      label: "Your Cascade Trigger",
      body: "You weren't sure what goes first when life gets loud. That's its own data point — track it as you go. Your scored lever is where the leverage is; the cascade trigger is your early-warning system.",
    };
  }
  if (cascadeTrigger === scoredEdge) {
    return {
      label: "Your Cascade Trigger",
      body: `You also said ${cap(cascadeTrigger)} is what goes first when life gets loud. Lever AND cascade trigger agree — both point to ${cap(cascadeTrigger)}. The signal is strong.`,
    };
  }
  return {
    label: "Your Cascade Trigger",
    body: `You said ${cap(cascadeTrigger)} is what goes first when life gets loud — that's your cascade trigger (your early-warning system). Your scored lever is ${cap(scoredEdge)} — that's where the leverage is. Build ${cap(scoredEdge)}. Protect ${cap(cascadeTrigger)}.`,
  };
}

function buildTextEmail({ firstName, codeTag, composite, anchorCopy, edgeCopy, cascadeBlock, integration, leverage, reanchor, cta }) {
  return `${firstName} —

Here's your full Queenager Code reading.

YOUR CODE: ${codeTag}
Thrive Score: ${composite} / 80

────────────────────────────────────────

01 · YOUR ANCHOR
${anchorCopy.headline}

${anchorCopy.body}

────────────────────────────────────────

02 · YOUR LEVER
${edgeCopy.headline}

${edgeCopy.body}

${edgeCopy.reframe}

${edgeCopy.closer}

${cascadeBlock ? `\n${cascadeBlock.label.toUpperCase()}\n${cascadeBlock.body}\n` : ""}
────────────────────────────────────────

03 · THE INTEGRATION INSIGHT

${typeof integration === "string" ? integration : ""}

────────────────────────────────────────

04 · YOUR LEVERAGE PLAY (the ah-hah)

${leverage?.intro || ""}

The play: ${leverage?.play || ""}

${leverage?.closer || ""}

────────────────────────────────────────

05 · YOUR RE-ANCHOR ROUTINE
${reanchor?.headline || ""}

${(reanchor?.steps || []).map((s, i) => `${i + 1}. ${s}`).join("\n")}

${reanchor?.closer || ""}

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

function buildHtmlEmail({ firstName, codeTag, composite, anchorCopy, edgeCopy, cascadeBlock, integration, leverage, reanchor, cta }) {
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
          <h1 style="margin:8px 0 0 0;color:${c.cream};font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:normal;">Here's your full Queenager Code reading.</h1>
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

        ${block("01 · ANCHOR", anchorCopy.headline, escapeHtml(anchorCopy.body))}

        <tr><td style="border-top:1px solid rgba(201,165,92,0.2);"></td></tr>

        ${block("02 · LEVER", edgeCopy.headline,
          `<p style="margin:0 0 12px 0;">${escapeHtml(edgeCopy.body)}</p>
           <p style="margin:0 0 12px 0;color:${c.cream};font-style:italic;">${escapeHtml(edgeCopy.reframe)}</p>
           <p style="margin:0;">${escapeHtml(edgeCopy.closer)}</p>`
        )}

        ${cascadeBlock ? `
        <tr><td style="padding:8px 0 24px 0;">
          <div style="border:1px solid rgba(201,165,92,0.3);background:rgba(26,26,31,0.4);border-radius:2px;padding:16px;">
            <div style="color:${c.gold};font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Helvetica,Arial,sans-serif;margin-bottom:8px;">${cascadeBlock.label}</div>
            <div style="color:rgba(250,246,240,0.85);font-family:Helvetica,Arial,sans-serif;font-size:14px;font-style:italic;line-height:1.6;">${escapeHtml(cascadeBlock.body)}</div>
          </div>
        </td></tr>` : ""}

        <tr><td style="border-top:1px solid rgba(201,165,92,0.2);"></td></tr>

        ${block("03 · INTEGRATION INSIGHT", "How they talk to each other.", typeof integration === "string" ? escapeHtml(integration) : "")}

        <tr><td style="border-top:1px solid rgba(201,165,92,0.2);"></td></tr>

        ${block("04 · THE LEVERAGE PLAY", "The ah-hah.",
          `<p style="margin:0 0 12px 0;">${escapeHtml(leverage?.intro || "")}</p>
           <p style="margin:0 0 12px 0;color:${c.cream};"><strong style="color:${c.gold};">The play:</strong> ${escapeHtml(leverage?.play || "")}</p>
           <p style="margin:0;font-style:italic;">${escapeHtml(leverage?.closer || "")}</p>`
        )}

        <tr><td style="border-top:1px solid rgba(201,165,92,0.2);"></td></tr>

        ${block("05 · YOUR RE-ANCHOR ROUTINE", reanchor?.headline || "",
          `<ol style="margin:0 0 12px 0;padding-left:18px;">${(reanchor?.steps || []).map(s => `<li style="margin-bottom:6px;">${escapeHtml(s)}</li>`).join("")}</ol>
           <p style="margin:12px 0 0 0;font-style:italic;color:${c.cream};">${escapeHtml(reanchor?.closer || "")}</p>`
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
