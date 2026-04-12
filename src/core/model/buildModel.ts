import { booleans, transforms } from '@jscad/modeling'
import type { ModelParams } from '../parameters/common'
import { extractRectangleParams } from '../parameters/rectangleParams'
import { extractOvalParams } from '../parameters/ovalParams'
import { buildRectangleTag } from '../builders/rectangleTag'
import { buildOvalTag } from '../builders/ovalTag'
import { buildKeyringHole } from '../builders/keyringHole'
import { applyText, getTextDimensions } from '../builders/textModes'
import { validateParams } from './validators'

/** Horizontal padding kept between text edge and shape edge (each side, mm). */
const H_PAD = 9

/** Vertical padding kept between text edge and shape edge (each side, mm). */
const V_PAD = 5

interface EffectiveDimensions {
  width: number
  height: number
  /** Y offset to apply to the text so it is centred in the usable area. */
  textOffsetY: number
}

/**
 * Derives the font size from the user-specified shape dimensions.
 * This is computed before any auto-scaling so the text size stays fixed and
 * it is the shape that adapts, not the font.
 */
function deriveFontSize(params: ModelParams): number {
  return Math.min(params.height * 0.32, params.width * 0.1, 9)
}

/**
 * Computes the effective shape dimensions required to contain the text with
 * consistent padding. If the text fits inside the user-specified dimensions,
 * the user dimensions are returned unchanged.
 *
 * When a keyring hole is present the usable area is shorter (the hole eats
 * into the top), so both the minimum height and the text Y offset are adjusted
 * to keep text centred in the remaining space.
 */
function computeEffectiveDimensions(params: ModelParams, fontSize: number): EffectiveDimensions {
  const { width, height, isKeychain, holeDiameter } = params

  // Space the hole occupies at the top: hole diameter + margin above + margin below
  const holeReserve = isKeychain ? holeDiameter + 6 : 0

  if (!params.text.trim()) {
    return { width, height, textOffsetY: -holeReserve / 2 }
  }

  const dims = getTextDimensions(params.text, fontSize)
  if (!dims) {
    return { width, height, textOffsetY: -holeReserve / 2 }
  }

  const minWidth = dims.width + H_PAD * 2
  const minHeight = dims.height + V_PAD * 2 + holeReserve

  const effectiveWidth = Math.max(width, minWidth)
  const effectiveHeight = Math.max(height, minHeight)

  // Centre the text in the usable region (below the hole).
  // The usable region spans [-(effectiveHeight/2), effectiveHeight/2 - holeReserve].
  // Its midpoint is at -(holeReserve / 2).
  const textOffsetY = -(holeReserve / 2)

  return { width: effectiveWidth, height: effectiveHeight, textOffsetY }
}

export function buildModel(params: ModelParams): any {
  const validation = validateParams(params)
  if (!validation.valid) {
    throw new Error(`Invalid parameters:\n${validation.errors.join('\n')}`)
  }

  const fontSize = deriveFontSize(params)
  const { width, height, textOffsetY } = computeEffectiveDimensions(params, fontSize)

  // Reflect effective dimensions back into a local params copy so every
  // downstream builder (shape, hole offset, corner radius) uses them.
  const effective: ModelParams = { ...params, width, height }

  // ── 1. Base shape ───────────────────────────────────────────
  let shape: any =
    effective.shape === 'rectangle'
      ? buildRectangleTag(extractRectangleParams(effective))
      : buildOvalTag(extractOvalParams(effective))

  // ── 2. Keyring hole ────────────────────────────────────────
  if (effective.isKeychain) {
    const holeMargin = effective.holeDiameter / 2 + 2
    const hole = buildKeyringHole({
      diameter: effective.holeDiameter,
      thickness: effective.thickness,
      offsetX: 0,
      offsetY: effective.height / 2 - holeMargin,
    })
    shape = booleans.subtract(shape, hole)
  }

  // ── 3. Text ────────────────────────────────────────────────
  if (effective.text.trim()) {
    const textGeom = applyText(effective.text, fontSize, effective.textMode, effective.thickness)

    if (textGeom) {
      // Shape spans z: [-thickness/2, +thickness/2] (centred at origin).
      const shapeTop = effective.thickness / 2
      const shapeBottom = -effective.thickness / 2

      switch (effective.textMode) {
        case 'positive': {
          const positioned = transforms.translate([0, textOffsetY, shapeTop], textGeom)
          shape = booleans.union(shape, positioned)
          break
        }
        case 'negative': {
          const depth = Math.min(1.5, effective.thickness * 0.45)
          const positioned = transforms.translate([0, textOffsetY, shapeTop - depth], textGeom)
          shape = booleans.subtract(shape, positioned)
          break
        }
        case 'cutout': {
          const positioned = transforms.translate([0, textOffsetY, shapeBottom - 1], textGeom)
          shape = booleans.subtract(shape, positioned)
          break
        }
      }
    }
  }

  return shape
}
