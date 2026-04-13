import { text, geometries, expansions, booleans, transforms, measurements } from '@jscad/modeling'
import type { TextMode, FontId } from '../parameters/common'
import { getFontProfile, DEFAULT_FONT_ID } from '../text/fontRegistry'
import { buildPositiveText } from '../text/positiveText'
import { buildNegativeText } from '../text/negativeText'
import { buildCutoutText } from '../text/cutoutText'

export interface TextDimensions {
  width: number
  height: number
}

/**
 * Creates a centered 2D geometry from a text string using the selected font profile.
 *
 * Accented characters (á, ê, ã, ç, etc.) are rendered correctly because all
 * font profiles use `extendedSimplexFont`, which adds glyph entries for code
 * points 192–252 to the base JSCAD simplex font. JSCAD's vectorChar looks up
 * glyphs by charCode with no ASCII range guard, so any code point present in
 * the font object is rendered as actual geometry rather than falling back to '?'.
 *
 * Characters with no glyph entry in the extended font (e.g. Arabic, Chinese)
 * still fall back to JSCAD's built-in '?' behaviour — this is a limitation of
 * the Hershey font system and cannot be avoided without a complete custom renderer.
 *
 * Returns null if the input is empty or produces no renderable segments.
 */
export function buildText2D(str: string, fontSize: number, fontId: FontId = DEFAULT_FONT_ID): any | null {
  if (!str.trim()) return null

  const profile = getFontProfile(fontId)
  const strokeDelta = fontSize * profile.strokeScale

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vectorOptions: Record<string, any> = {
    height: fontSize,
    input: str,
    letterSpacing: profile.letterSpacing,
  }

  // Pass the font when the profile specifies one. All current profiles do so
  // (they use extendedSimplexFont). If fontData is absent, JSCAD defaults to
  // its internal simplex — without accented character support.
  if (profile.fontData !== undefined) {
    vectorOptions['font'] = profile.fontData
  }

  const segments: [number, number][][] = text.vectorText(vectorOptions)

  const strokes = segments
    .filter((seg) => seg.length >= 2)
    .map((seg) => {
      const path = geometries.path2.fromPoints({ closed: false }, seg)
      return expansions.expand({
        delta: strokeDelta,
        corners: profile.expandCorners,
        segments: profile.expandSegments,
      }, path)
    })

  if (strokes.length === 0) return null

  const united = strokes.length === 1 ? strokes[0] : booleans.union(...strokes)
  return transforms.center({ axes: [true, true] }, united)
}

/**
 * Measures the bounding-box dimensions of a text string rendered at the given
 * font size and font style. Returns null for empty input.
 */
export function getTextDimensions(str: string, fontSize: number, fontId: FontId = DEFAULT_FONT_ID): TextDimensions | null {
  const geom2D = buildText2D(str, fontSize, fontId)
  if (!geom2D) return null

  // measureBoundingBox returns [[minX, minY, 0], [maxX, maxY, 0]] for geom2
  const bbox: [[number, number, number], [number, number, number]] =
    measurements.measureBoundingBox(geom2D)

  return {
    width: bbox[1][0] - bbox[0][0],
    height: bbox[1][1] - bbox[0][1],
  }
}

/**
 * Builds the 3D text geometry for the given mode, ready to be positioned and
 * applied to the base shape via boolean union/subtract.
 *
 * @param reliefDepth  Height of raised text above the surface (positive mode).
 * @param insetDepth   Depth of engraved pocket (negative mode); already clamped
 *                     to a safe fraction of the shape thickness by the caller.
 * @param fontId       Font style to use for glyph rendering.
 *
 * Returns null if no text geometry can be produced.
 */
export function applyText(
  str: string,
  fontSize: number,
  mode: TextMode,
  thickness: number,
  reliefDepth: number,
  insetDepth: number,
  fontId: FontId = DEFAULT_FONT_ID,
): any | null {
  const geom2D = buildText2D(str, fontSize, fontId)
  if (!geom2D) return null

  switch (mode) {
    case 'positive':
      return buildPositiveText(geom2D, reliefDepth)
    case 'negative':
      return buildNegativeText(geom2D, insetDepth)
    case 'cutout':
      return buildCutoutText(geom2D, thickness)
  }
}
