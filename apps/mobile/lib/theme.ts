// ── Bhasha Academy — Wes Anderson design system ───────────────────────────────

export const T = {
  // Core palette
  green:        "#1b4d3e",   // Bottle Green — primary, borders, text
  red:          "#d64545",   // Wes Red — active states, accent, names
  gold:         "#f4c542",   // Gold — XP, trophies, boosts
  bg:           "#fdfaf1",   // Parchment — screen background
  card:         "#f4ebd0",   // Warm card background
  border:       "#e5dcc5",   // Dividers, card edges
  success:      "#17cf36",   // Correct answers, completion
  white:        "#ffffff",

  // Text scale
  text:         "#1b4d3e",
  textMid:      "rgba(27,77,62,0.60)",
  textMuted:    "rgba(27,77,62,0.40)",

  // Dialect accent colours (unchanged from existing)
  sylheti:      "#7c3aed",
  barisali:     "#0284c7",
  chittagonian: "#d97706",
} as const;

// ── Brutalist offset shadow (no blur — hard-edge Wes Anderson feel) ────────────
export const SHADOW = {
  // Standard green hard shadow
  green: {
    shadowColor:  "#1b4d3e",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  // Red hard shadow (for active / CTA cards)
  red: {
    shadowColor:  "#d64545",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  // Subtle soft shadow for smaller elements
  soft: {
    shadowColor:  "#1b4d3e",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 0,
    elevation: 2,
  },
} as const;

// ── Loaded font family names (from @expo-google-fonts/space-grotesk) ──────────
export const FONT = {
  light:    "SpaceGrotesk_300Light",
  regular:  "SpaceGrotesk_400Regular",
  medium:   "SpaceGrotesk_500Medium",
  semibold: "SpaceGrotesk_600SemiBold",
  bold:     "SpaceGrotesk_700Bold",
} as const;

// ── Reusable style snippets ────────────────────────────────────────────────────

/** Uppercase micro-label (10px, tracked, bold) */
export const MICRO: object = {
  fontSize: 10,
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: 1.5,
} as const;
