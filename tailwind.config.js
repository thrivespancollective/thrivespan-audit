/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── THE CROWN STANDARD — TeamQueen's locked five ──────────────────
        // Source of truth: Helios → _Core/TeamQueen_Visual_Identity.md
        // Corrected 2026-08-05. Do NOT add a sixth colour here; propose it to
        // canon first, then bring it back.
        plum: "#3C1D3F",      // PRIMARY — wordmark, dark grounds, headings
        gold: "#CDB15B",      // ACCENT ONLY — crown, thin dividers, the mark
        blush: "#E6C1C8",     // Blush Resolve — warm accent + CTA fills
        cream: "#FAF7F2",     // Ivory Silk — the ground
        charcoal: "#1A1A1A",  // Charcoal Ink — dark text (never pure black)

        // 🥇 THE GOLD RULE: gold is a THIN accent — the ring, the crown, a
        // divider. Never a fill, never body text. Overdone gold reads mustard.
        // Depth comes from ONE gold at varying opacity (100 / 75 / 25-35%),
        // never from a second gold.

        // Retired ThriveSpan palette — aliased so nothing breaks mid-rebrand.
        // ⬜ Remove these once every usage is migrated.
        ink: "#1A1A1A",
        crimson: "#9B2C2C",
        pink: "#E6C1C8",
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
