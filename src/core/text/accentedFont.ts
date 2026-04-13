/**
 * Extended Hershey simplex font with accented character support.
 *
 * JSCAD's vectorChar renderer looks up glyphs by char code:
 *   let code = input.charCodeAt(0)
 *   if (!code || !font[code]) { code = 63 /* '?' *\/ }
 *
 * There is no ASCII range guard. Adding entries for code points above 126
 * (e.g. 234 for 'ê') makes JSCAD render them correctly instead of falling
 * back to '?'.
 *
 * Each accented glyph is composed at module-load time:
 *   [ advanceWidth, ...baseStrokes, undefined, ...accentStrokes ]
 * where 'undefined' is the JSCAD path-break sentinel (vectorChar splits
 * strokes at every undefined element in the glyph array).
 *
 * Accents are generated relative to the base character's advance width so
 * that they are always centred horizontally regardless of which base letter
 * they are applied to.
 *
 * Hershey simplex coordinate reference (font.height = 14):
 *   Baseline              y = 0
 *   Lowercase x-height    y ≈ 14
 *   Uppercase cap height  y ≈ 21
 *   Simplex 'i' / 'j' dot y ≈ 20–22   (unusually high in this font)
 *
 * Covered characters:
 *   Lowercase: á à â ã ä / é è ê ë / í ì î ï / ó ò ô õ ö / ú ù û ü / ç
 *   Uppercase: Á À Â Ã Ä / É È Ê Ë / Í Ì Î Ï / Ó Ò Ô Õ Ö / Ú Ù Û Ü / Ç
 */

// Vite handles CJS→ESM interop; the font file uses `module.exports = {...}`.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import simplexBase from '@jscad/modeling/src/text/fonts/single-line/hershey/simplex.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GlyphData = (number | undefined)[]
type AccentFn   = (advanceWidth: number) => GlyphData

// ── Accent stroke generators ────────────────────────────────────────────────
//
// Each generator receives the advance width of the base character and returns
// the stroke array for the diacritical mark (WITHOUT the leading advance-width
// element — that is inherited from the base glyph).

const ACCENT: Record<string, AccentFn> = {

  // ── Lowercase accents (place above x-height ≈ 14, range y = 16–20) ───────

  /** ´ acute — short diagonal going up-right */
  'lc-acute': (w) => [w / 2 - 1, 16, w / 2 + 2, 20],

  /** ` grave — short diagonal going up-left */
  'lc-grave': (w) => [w / 2 + 2, 16, w / 2 - 1, 20],

  /** ^ circumflex — inverted-V */
  'lc-circ':  (w) => [w / 2 - 3, 16, w / 2, 20, w / 2 + 3, 16],

  /** ~ tilde — four-point wave */
  'lc-tilde': (w) => [w / 2 - 4, 17, w / 2 - 1, 20, w / 2 + 2, 17, w / 2 + 4, 20],

  /** ¨ diaeresis — two tiny strokes */
  'lc-diaer': (w): GlyphData =>
    [w / 2 - 3, 17, w / 2 - 2, 18, undefined, w / 2 + 1, 17, w / 2 + 2, 18],

  // ── i/j-style lowercase accents ──────────────────────────────────────────
  //
  // The Hershey simplex 'i' (105) and 'j' (106) glyphs include a small dot
  // rendered at y = 20–22, above the normal x-height. Accents for í/ì/î/ï
  // are therefore placed higher (y = 24–27) so they sit clearly above the dot.

  /** ´ acute above 'i' dot */
  'i-acute':  (w) => [w / 2 - 1, 24, w / 2 + 2, 27],

  /** ` grave above 'i' dot */
  'i-grave':  (w) => [w / 2 + 2, 24, w / 2 - 1, 27],

  /** ^ circumflex above 'i' dot */
  'i-circ':   (w) => [w / 2 - 3, 24, w / 2, 27, w / 2 + 3, 24],

  /** ¨ diaeresis above 'i' dot */
  'i-diaer':  (w): GlyphData =>
    [w / 2 - 3, 24, w / 2 - 2, 25, undefined, w / 2 + 1, 24, w / 2 + 2, 25],

  // ── Uppercase accents (place above cap height ≈ 21, range y = 23–27) ─────

  /** ´ acute — uppercase */
  'uc-acute': (w) => [w / 2 - 1, 23, w / 2 + 2, 27],

  /** ` grave — uppercase */
  'uc-grave': (w) => [w / 2 + 2, 23, w / 2 - 1, 27],

  /** ^ circumflex — uppercase */
  'uc-circ':  (w) => [w / 2 - 3, 23, w / 2, 27, w / 2 + 3, 23],

  /** ~ tilde — uppercase */
  'uc-tilde': (w) => [w / 2 - 4, 24, w / 2 - 1, 27, w / 2 + 2, 24, w / 2 + 4, 27],

  /** ¨ diaeresis — uppercase */
  'uc-diaer': (w): GlyphData =>
    [w / 2 - 3, 24, w / 2 - 2, 25, undefined, w / 2 + 1, 24, w / 2 + 2, 25],

  // ── Cedilla (hook below baseline, y = 0 to y ≈ −3) ──────────────────────

  /** ¸ cedilla — small curved hook below the letter */
  'cedilla':  (w) => [w / 2 + 1, 0, w / 2, -1, w / 2 - 1, -3, w / 2 - 3, -2],
}

// ── Accent map ──────────────────────────────────────────────────────────────
//
// Each entry: [targetCode, baseCharCode, accentKey]
// targetCode  — Unicode code point of the accented character
// baseCharCode — code point of the base ASCII character in the simplex font
// accentKey   — key into ACCENT above

const ACCENT_MAP: [number, number, string][] = [
  // á à â ã ä  (base: a = 97)
  [225, 97, 'lc-acute'], [224, 97, 'lc-grave'], [226, 97, 'lc-circ'],
  [227, 97, 'lc-tilde'], [228, 97, 'lc-diaer'],
  // é è ê ë  (base: e = 101)
  [233, 101, 'lc-acute'], [232, 101, 'lc-grave'], [234, 101, 'lc-circ'],
  [235, 101, 'lc-diaer'],
  // í ì î ï  (base: i = 105  — use i-style accents above the dot)
  [237, 105, 'i-acute'],  [236, 105, 'i-grave'],  [238, 105, 'i-circ'],
  [239, 105, 'i-diaer'],
  // ó ò ô õ ö  (base: o = 111)
  [243, 111, 'lc-acute'], [242, 111, 'lc-grave'], [244, 111, 'lc-circ'],
  [245, 111, 'lc-tilde'], [246, 111, 'lc-diaer'],
  // ú ù û ü  (base: u = 117)
  [250, 117, 'lc-acute'], [249, 117, 'lc-grave'], [251, 117, 'lc-circ'],
  [252, 117, 'lc-diaer'],
  // ç  (base: c = 99)
  [231, 99, 'cedilla'],
  // Á À Â Ã Ä  (base: A = 65)
  [193, 65, 'uc-acute'],  [192, 65, 'uc-grave'],  [194, 65, 'uc-circ'],
  [195, 65, 'uc-tilde'],  [196, 65, 'uc-diaer'],
  // É È Ê Ë  (base: E = 69)
  [201, 69, 'uc-acute'],  [200, 69, 'uc-grave'],  [202, 69, 'uc-circ'],
  [203, 69, 'uc-diaer'],
  // Í Ì Î Ï  (base: I = 73)
  [205, 73, 'uc-acute'],  [204, 73, 'uc-grave'],  [206, 73, 'uc-circ'],
  [207, 73, 'uc-diaer'],
  // Ó Ò Ô Õ Ö  (base: O = 79)
  [211, 79, 'uc-acute'],  [210, 79, 'uc-grave'],  [212, 79, 'uc-circ'],
  [213, 79, 'uc-tilde'],  [214, 79, 'uc-diaer'],
  // Ú Ù Û Ü  (base: U = 85)
  [218, 85, 'uc-acute'],  [217, 85, 'uc-grave'],  [219, 85, 'uc-circ'],
  [220, 85, 'uc-diaer'],
  // Ç  (base: C = 67)
  [199, 67, 'cedilla'],
]

// ── Font builder ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildExtendedFont(): Record<string | number, any> {
  // Shallow-copy so we never mutate the imported module.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const font: Record<string | number, any> = { ...simplexBase }

  for (const [targetCode, baseCode, accentKey] of ACCENT_MAP) {
    const baseGlyph: GlyphData | undefined = font[baseCode]
    if (!baseGlyph || baseGlyph.length < 1) continue

    const advanceWidth = baseGlyph[0] as number
    const baseStrokes  = baseGlyph.slice(1)   // drop the leading advance-width entry
    const accentFn     = ACCENT[accentKey]
    if (!accentFn) continue

    // Compose: [advanceWidth, ...baseStrokes, undefined (break), ...accentStrokes]
    font[targetCode] = [advanceWidth, ...baseStrokes, undefined, ...accentFn(advanceWidth)]
  }

  return font
}

/**
 * Hershey simplex font extended with glyph entries for Portuguese and
 * common Western-European accented characters.
 *
 * Pass this as the `font` option to JSCAD's vectorText() to enable correct
 * rendering of characters like ê, ã, ç, etc.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extendedSimplexFont: Record<string | number, any> = buildExtendedFont()
