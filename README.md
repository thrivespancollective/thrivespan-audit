# The Queenager Body Audit

The interactive 4-Pillar Audit for ThriveSpan Collective. Built per the BOTAO offer-flow framework: a premium lead magnet that names the buyer's Anchor pillar, Edge pillar, Leverage Play, and Re-Anchor Routine — then routes her to Workshop / SUS Lab / Move Accelerator / The Build.

## Stack

- Next.js 14 (App Router) + React 18
- Tailwind CSS
- Vercel hosting + auto-deploy from GitHub
- Circle Email Hub for subscriber capture + tagging

## Content source

Audit content lives in `lib/content.js` — derived from `Helios/01_Domains/ThriveSpan/Marketing/LeadMagnets/4-PillarAudit.md` (v6).

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in:
- `CIRCLE_API_TOKEN` — from Circle admin
- `CIRCLE_COMMUNITY_ID` — from Circle admin
- `CIRCLE_AUDIENCE_SPACE_ID` — optional, for targeted list assignment

Add the same vars in Vercel project settings.

## Deploy

Push to `main` → Vercel auto-deploys. Custom domain: `audit.thrivespancollective.com`.
