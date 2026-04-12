import { text, geometries, expansions, booleans, transforms, measurements } from '@jscad/modeling'
import type { TextMode } from '../parameters/common'
import { buildPositiveText } from '../text/positiveText'
import { buildNegativeText } from '../text/negativeText'
import { buildCutoutText } from '../text/cutoutText'

export interface TextDimensions {
  width: number
  height: number
}

/**
 * Creates a centered 2D geometry from a text string using vector font segments.
 * Returns null if the input is empty or produces no renderable segments.
 */
export function buildText2D(str: string, fontSize: number): any | null {
  if (!str.trim()) return null

  const strokeDelta = fontSize * 0.07
  const segments: [number, number][][] = text.vectorText({ height: fontSize, input: str })

  const strokes = segments
    .filter((seg) => seg.length >= 2)
    .map((seg) => {
      const path = geometries.path2.fromPoints({ closed: false }, seg)
      return expansions.expand({ delta: strokeDelta, corners: 'round', segments: 4 }, path)
    })

  if (strokes.length === 0) return null

  const united = strokes.length === 1 ? strokes[0] : booleans.union(...strokes)
  return transforms.center({ axes: [true, true] }, united)
}

/**
 * Measures the bounding-box dimensions of a text string rendered at the given
 * font size, including stroke expansion. Returns null for empty input.
 */
export function getTextDimensions(str: string, fontSize: number): TextDimensions | null {
  const geom2D = buildText2D(str, fontSize)
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
 * Builds the text geometry for the given mode, ready to be applied to the base shape.
 * Returns null if no text geometry can be produced.
 */
export function applyText(
  str: string,
  fontSize: number,
  mode: TextMode,
  thickness: number,
): any | null {
  const geom2D = buildText2D(str, fontSize)
  if (!geom2D) return null

  switch (mode) {
    case 'positive':
      return buildPositiveText(geom2D, 1.2)
    case 'negative':
      return buildNegativeText(geom2D, Math.min(1.5, thickness * 0.45))
    case 'cutout':
      return buildCutoutText(geom2D, thickness)
  }
}
