/**
 * NomiCAD Font Registry
 *
 * JSCAD ships with exactly one built-in Hershey font: "simplex" (single-stroke
 * sans-serif).  All text is rendered by expanding each stroke polyline into a
 * flat 2-D shape and then extruding it.
 *
 * NomiCAD exposes 15 visual styles built on that glyph set by varying:
 *   • strokeScale     – thickness of each stroke relative to the font size
 *   • letterSpacing   – extra horizontal space between characters
 *   • expandCorners   – joint shape at stroke ends/corners ('round' | 'edge')
 *   • expandSegments  – arc smoothness for rounded corners
 *
 * Fonts are grouped into three UI categories:
 *   Classic     – weight variants (Simplex, Bold, Light, Heavy, Poster)
 *   Proportions – spacing variants (Condensed, Extended, Bold Condensed, Bold Extended, Wide)
 *   Style       – corner/cap variants (Angular, Stencil, Technical, Engraved, Rounded)
 *
 * All styles share `extendedSimplexFont` as their glyph data, which is the
 * JSCAD built-in simplex font augmented with accented character glyphs so that
 * Portuguese text (ê, ã, ç, etc.) renders correctly instead of falling back to '?'.
 *
 * Adding a new style: append an entry to FONT_REGISTRY, extend FontId, add to FONT_IDS,
 *   add i18n keys in en.ts and pt-BR.ts, and add the entry to the dropdown groups in controls.ts.
 * Adding a new glyph set: provide a Hershey-format data object in `fontData`.
 *   See accentedFont.ts for the extension pattern.
 */

import { extendedSimplexFont } from './accentedFont'

// ── Types ──────────────────────────────────────────────────────────────────

/**
 * Hershey-format font object as expected by JSCAD's vectorText().
 * The index signature uses `any` because glyph arrays contain mixed
 * number | undefined values (undefined = path-break sentinel).
 */
export interface HersheyFont {
  height: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [charCode: number]: any
}

export type FontId =
  // Classic (weight)
  | 'simplex'
  | 'simplex-bold'
  | 'simplex-light'
  | 'heavy'
  | 'poster'
  // Proportions (spacing)
  | 'condensed'
  | 'extended'
  | 'bold-condensed'
  | 'bold-extended'
  | 'wide'
  // Style (corner / cap)
  | 'simplex-angular'
  | 'stencil'
  | 'technical'
  | 'engraved'
  | 'rounded'

export interface FontProfile {
  id: FontId
  /** Human-readable label shown in the UI dropdown. */
  label: string
  /**
   * Hershey glyph dataset passed to JSCAD's vectorText() as the `font` option.
   * All current profiles use `extendedSimplexFont` (simplex + accented chars).
   * Set to undefined to fall back to JSCAD's internal simplex (no accent support).
   * Typed as `any` because the Hershey format mixes number and undefined values
   * in a way that cannot be expressed cleanly in a TypeScript index signature.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fontData?: any
  /**
   * strokeDelta = fontSize × strokeScale.
   * Controls how thick each stroke appears after path expansion.
   */
  strokeScale: number
  /**
   * Passed to vectorText.  1.0 = default letter spacing.
   * Values < 1 are condensed; > 1 are wider.
   */
  letterSpacing: number
  /**
   * Corner style for expansions.expand().
   * 'round'  → pill-shaped caps (default, smoothest)
   * 'edge'   → flat rectangular caps (angular/technical look)
   */
  expandCorners: 'round' | 'edge'
  /**
   * Arc approximation segments for 'round' corners.
   * Higher = smoother circles, but more geometry.
   */
  expandSegments: number
}

// ── Registry ───────────────────────────────────────────────────────────────

const FONT_REGISTRY: Record<FontId, FontProfile> = {

  // ── Classic group ───────────────────────────────────────────

  /** Simplex — the JSCAD-native single-stroke sans-serif. Clean default. */
  simplex: {
    id: 'simplex',
    label: 'Simplex',
    fontData: extendedSimplexFont,
    strokeScale: 0.07,
    letterSpacing: 1.0,
    expandCorners: 'round',
    expandSegments: 4,
  },

  /** Bold — wider stroke expansion. More legible at small sizes. */
  'simplex-bold': {
    id: 'simplex-bold',
    label: 'Bold',
    fontData: extendedSimplexFont,
    strokeScale: 0.13,
    letterSpacing: 1.0,
    expandCorners: 'round',
    expandSegments: 4,
  },

  /** Light — fine strokes, elegant and delicate. */
  'simplex-light': {
    id: 'simplex-light',
    label: 'Light',
    fontData: extendedSimplexFont,
    strokeScale: 0.04,
    letterSpacing: 1.0,
    expandCorners: 'round',
    expandSegments: 8,
  },

  /** Heavy — very thick strokes. High-contrast, reads well at distance. */
  heavy: {
    id: 'heavy',
    label: 'Heavy',
    fontData: extendedSimplexFont,
    strokeScale: 0.18,
    letterSpacing: 1.0,
    expandCorners: 'round',
    expandSegments: 4,
  },

  /** Poster — ultra-thick display strokes. Best for short text at large sizes. */
  poster: {
    id: 'poster',
    label: 'Poster',
    fontData: extendedSimplexFont,
    strokeScale: 0.22,
    letterSpacing: 1.0,
    expandCorners: 'round',
    expandSegments: 4,
  },

  // ── Proportions group ───────────────────────────────────────

  /** Condensed — standard weight, narrow letter spacing. */
  condensed: {
    id: 'condensed',
    label: 'Condensed',
    fontData: extendedSimplexFont,
    strokeScale: 0.07,
    letterSpacing: 0.72,
    expandCorners: 'round',
    expandSegments: 4,
  },

  /** Extended — standard weight, wide letter spacing. Open and airy. */
  extended: {
    id: 'extended',
    label: 'Extended',
    fontData: extendedSimplexFont,
    strokeScale: 0.07,
    letterSpacing: 1.42,
    expandCorners: 'round',
    expandSegments: 4,
  },

  /** Bold Condensed — heavier strokes with narrow spacing. */
  'bold-condensed': {
    id: 'bold-condensed',
    label: 'Bold Condensed',
    fontData: extendedSimplexFont,
    strokeScale: 0.12,
    letterSpacing: 0.75,
    expandCorners: 'round',
    expandSegments: 4,
  },

  /** Bold Extended — heavier strokes with wide spacing. Commanding headline. */
  'bold-extended': {
    id: 'bold-extended',
    label: 'Bold Extended',
    fontData: extendedSimplexFont,
    strokeScale: 0.12,
    letterSpacing: 1.38,
    expandCorners: 'round',
    expandSegments: 4,
  },

  /** Wide — light strokes with very open spacing. Sophisticated feel. */
  wide: {
    id: 'wide',
    label: 'Wide',
    fontData: extendedSimplexFont,
    strokeScale: 0.055,
    letterSpacing: 1.65,
    expandCorners: 'round',
    expandSegments: 6,
  },

  // ── Style group ─────────────────────────────────────────────

  /** Angular — flat rectangular stroke caps. Technical / engraving look. */
  'simplex-angular': {
    id: 'simplex-angular',
    label: 'Angular',
    fontData: extendedSimplexFont,
    strokeScale: 0.08,
    letterSpacing: 1.0,
    expandCorners: 'edge',
    expandSegments: 1,
  },

  /** Stencil — thick strokes with flat square caps. Classic stencil aesthetic. */
  stencil: {
    id: 'stencil',
    label: 'Stencil',
    fontData: extendedSimplexFont,
    strokeScale: 0.10,
    letterSpacing: 1.1,
    expandCorners: 'edge',
    expandSegments: 1,
  },

  /** Technical — medium-thin strokes with precise flat caps. Engineering look. */
  technical: {
    id: 'technical',
    label: 'Technical',
    fontData: extendedSimplexFont,
    strokeScale: 0.065,
    letterSpacing: 0.95,
    expandCorners: 'edge',
    expandSegments: 2,
  },

  /** Engraved — very fine strokes with square caps. Ideal for CNC engraving. */
  engraved: {
    id: 'engraved',
    label: 'Engraved',
    fontData: extendedSimplexFont,
    strokeScale: 0.05,
    letterSpacing: 0.9,
    expandCorners: 'edge',
    expandSegments: 1,
  },

  /** Rounded — medium strokes with extra-smooth round caps. Friendly, soft. */
  rounded: {
    id: 'rounded',
    label: 'Rounded',
    fontData: extendedSimplexFont,
    strokeScale: 0.09,
    letterSpacing: 1.05,
    expandCorners: 'round',
    expandSegments: 16,
  },
}

// ── Public API ─────────────────────────────────────────────────────────────

/** Ordered list of all available font IDs — drives the UI dropdown. */
export const FONT_IDS: FontId[] = [
  // Classic
  'simplex', 'simplex-bold', 'simplex-light', 'heavy', 'poster',
  // Proportions
  'condensed', 'extended', 'bold-condensed', 'bold-extended', 'wide',
  // Style
  'simplex-angular', 'stencil', 'technical', 'engraved', 'rounded',
]

/** Returns the profile for a given font ID (always valid). */
export function getFontProfile(id: FontId): FontProfile {
  return FONT_REGISTRY[id]
}

/** Default font used when no preference is set. */
export const DEFAULT_FONT_ID: FontId = 'simplex'
