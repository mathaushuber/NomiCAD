import { booleans, transforms } from '@jscad/modeling'
import type { ModelParams, Shape, KeychainPosition } from '../parameters/common'
import { extractRectangleParams } from '../parameters/rectangleParams'
import { extractOvalParams } from '../parameters/ovalParams'
import { buildRectangleTag } from '../builders/rectangleTag'
import { buildOvalTag } from '../builders/ovalTag'
import { buildCircleTag } from '../builders/circleTag'
import { buildTriangleTag } from '../builders/triangleTag'
import { buildHexagonTag } from '../builders/hexagonTag'
import { buildStarTag } from '../builders/starTag'
import { buildHeartTag } from '../builders/heartTag'
import { buildKeyringHole } from '../builders/keyringHole'
import { buildKeychainTab, shapeEdgeDistance } from '../builders/keychainTab'
import { applyText, getTextDimensions } from '../builders/textModes'
import { validateParams } from './validators'

// ── Layout constants ───────────────────────────────────────────────────────

/** Horizontal padding between text edge and shape edge (each side, mm). */
const H_PAD = 9

/** Vertical padding between text edge and shape edge (each side, mm). */
const V_PAD = 5

/**
 * How far (mm) positive text geometry is embedded below the shape top face
 * before the union.  Must exceed typical slicer vertex-merge tolerances to
 * avoid coplanar faces in the exported STL.
 */
const TEXT_POSITIVE_EMBED = 0.2

/**
 * Safety clearance (mm) between the text bounding rectangle and the keyring
 * hole circle when placement is 'inside'.
 */
const HOLE_TEXT_CLEARANCE = 2

// ── Interior hole positioning ──────────────────────────────────────────────

function insideHoleXY(
  shape: Shape,
  position: KeychainPosition,
  width: number,
  height: number,
  holeDiameter: number,
): [number, number] {
  const margin = holeDiameter / 2 + 2
  const edge = shapeEdgeDistance(shape, position, width, height)
  switch (position) {
    case 'top':    return [0,  edge - margin]
    case 'bottom': return [0, -(edge - margin)]
    case 'left':   return [-(edge - margin), 0]
    case 'right':  return [edge - margin, 0]
  }
}

// ── Effective dimension calculation ────────────────────────────────────────

interface EffectiveDimensions {
  width: number
  height: number
  /** Auto-centering offset X that shifts text into the hole-free zone (mm). */
  autoOffsetX: number
  /** Auto-centering offset Y that shifts text into the hole-free zone (mm). */
  autoOffsetY: number
}

/** Minimum safe font size for JSCAD geometry (mm). Below this, geometry becomes degenerate. */
const MIN_FONT_SIZE = 0.1

/**
 * Derives the effective font size by combining the auto-fit base size with
 * the user's `textSize` multiplier.
 */
function deriveFontSize(params: ModelParams): number {
  const base = Math.min(params.height * 0.32, params.width * 0.1, 9)
  const clamped = Math.max(0.3, Math.min(3.0, params.textSize))
  return Math.max(MIN_FONT_SIZE, base * clamped)
}

/**
 * Computes effective shape dimensions (potentially expanded to fit text) and
 * the auto-centering offsets that shift text into the hole-free zone when an
 * inside-placement hole is active.
 *
 * The auto offsets are a baseline.  The user's textOffsetX/Y are ADDED on top
 * in computeTextPosition(), then the combined value is clamped to the valid area.
 */
function computeEffectiveDimensions(params: ModelParams, fontSize: number): EffectiveDimensions {
  const { width, height, isKeychain, holeDiameter, keychainPosition, keychainPlacement } = params

  // Only inside-placement holes eat into the usable interior.
  const insideHole = isKeychain && keychainPlacement === 'inside'
  const holeReserve = insideHole ? holeDiameter + 6 : 0

  const isVertical = keychainPosition === 'top' || keychainPosition === 'bottom'
  const verticalReserve   = isVertical ? holeReserve : 0
  const horizontalReserve = isVertical ? 0 : holeReserve

  // Auto offset: shift text centre into the hole-free half of the shape.
  const autoOffsetY =
    keychainPosition === 'top'    ? -(verticalReserve / 2) :
    keychainPosition === 'bottom' ?  (verticalReserve / 2) : 0

  const autoOffsetX =
    keychainPosition === 'left'  ?  (horizontalReserve / 2) :
    keychainPosition === 'right' ? -(horizontalReserve / 2) : 0

  if (!params.text.trim()) {
    return { width, height, autoOffsetX, autoOffsetY }
  }

  const dims = getTextDimensions(params.text, fontSize, params.fontFamily)
  if (!dims) {
    return { width, height, autoOffsetX, autoOffsetY }
  }

  const minWidth  = dims.width  + H_PAD * 2 + horizontalReserve
  const minHeight = dims.height + V_PAD * 2 + verticalReserve

  return {
    width:       Math.max(width,  minWidth),
    height:      Math.max(height, minHeight),
    autoOffsetX,
    autoOffsetY,
  }
}

// ── Text position clamping ─────────────────────────────────────────────────

/**
 * Computes the final XY position for text rendering.
 *
 * Strategy:
 *  1. Start from (autoOffsetX + params.textOffsetX, autoOffsetY + params.textOffsetY).
 *  2. Clamp to keep the text bounding box within the shape with H_PAD/V_PAD margin.
 *  3. If an inside-placement hole is active, additionally push the text away
 *     from the hole so the two never overlap.
 *
 * The result is always a valid position — geometry never lands outside the
 * shape boundary or over an inside hole.
 */
function computeTextPosition(
  effective: ModelParams,
  textW: number,
  textH: number,
  autoOffsetX: number,
  autoOffsetY: number,
): [number, number] {
  const { width: sw, height: sh } = effective

  // ── 1. Shape boundary limits ─────────────────────────────────────────────
  const maxTx = Math.max(0, sw / 2 - textW / 2 - H_PAD)
  const maxTy = Math.max(0, sh / 2 - textH / 2 - V_PAD)

  let tx = Math.max(-maxTx, Math.min(maxTx, autoOffsetX + effective.textOffsetX))
  let ty = Math.max(-maxTy, Math.min(maxTy, autoOffsetY + effective.textOffsetY))

  // ── 2. Inside-hole exclusion ─────────────────────────────────────────────
  if (effective.isKeychain && effective.keychainPlacement === 'inside') {
    const [hx, hy] = insideHoleXY(
      effective.shape,
      effective.keychainPosition,
      effective.width,
      effective.height,
      effective.holeDiameter,
    )
    const holeR   = effective.holeDiameter / 2
    const clearR  = holeR + HOLE_TEXT_CLEARANCE  // minimum centre-to-edge distance

    // Axis-aligned rectangular exclusion: text rectangle must not overlap the
    // hole circle's bounding box (extended by half the text size on each side).
    switch (effective.keychainPosition) {
      case 'top':
        // Hole is near the top edge; text must stay below it.
        ty = Math.min(ty, hy - clearR - textH / 2)
        break
      case 'bottom':
        // Hole is near the bottom edge; text must stay above it.
        ty = Math.max(ty, hy + clearR + textH / 2)
        break
      case 'left':
        // Hole is near the left edge; text must stay to the right.
        tx = Math.max(tx, hx + clearR + textW / 2)
        break
      case 'right':
        // Hole is near the right edge; text must stay to the left.
        tx = Math.min(tx, hx - clearR - textW / 2)
        break
    }

    // Re-clamp to shape bounds after the hole push (edge cases on small shapes).
    tx = Math.max(-maxTx, Math.min(maxTx, tx))
    ty = Math.max(-maxTy, Math.min(maxTy, ty))
  }

  return [tx, ty]
}

// ── Public builder ─────────────────────────────────────────────────────────

export function buildModel(params: ModelParams): any {
  const validation = validateParams(params)
  if (!validation.valid) {
    throw new Error(`Invalid parameters:\n${validation.errors.join('\n')}`)
  }

  const fontSize = deriveFontSize(params)
  const { fontFamily } = params
  let { width, height, autoOffsetX, autoOffsetY } = computeEffectiveDimensions(params, fontSize)

  // Circle must stay equilateral: expand to the larger effective dimension.
  if (params.shape === 'circle') {
    const dim = Math.max(width, height)
    width  = dim
    height = dim
  }

  // All downstream builders use the effective (possibly expanded) dimensions.
  const effective: ModelParams = { ...params, width, height }

  // Clamp inset depth to a safe fraction of thickness so we never cut through.
  const safeInsetDepth = Math.min(effective.textInsetDepth, effective.thickness * 0.8)

  // ── 1. Base shape ──────────────────────────────────────────────────────
  let shape: any
  switch (effective.shape) {
    case 'rectangle':
      shape = buildRectangleTag(extractRectangleParams(effective))
      break
    case 'rounded-rectangle':
      shape = buildRectangleTag({
        ...extractRectangleParams(effective),
        cornerRadius: Math.min(effective.width, effective.height) * 0.25,
      })
      break
    case 'oval':
      shape = buildOvalTag(extractOvalParams(effective))
      break
    case 'circle':
      shape = buildCircleTag({ diameter: effective.width, thickness: effective.thickness })
      break
    case 'triangle':
      shape = buildTriangleTag({ width: effective.width, height: effective.height, thickness: effective.thickness })
      break
    case 'hexagon':
      shape = buildHexagonTag({ width: effective.width, height: effective.height, thickness: effective.thickness })
      break
    case 'star':
      shape = buildStarTag({ width: effective.width, height: effective.height, thickness: effective.thickness })
      break
    case 'heart':
      shape = buildHeartTag({ width: effective.width, height: effective.height, thickness: effective.thickness })
      break
  }

  // ── 2. Keychain hole ──────────────────────────────────────────────────
  if (effective.isKeychain) {
    if (effective.keychainPlacement === 'outside') {
      const { tab, holeX, holeY } = buildKeychainTab({
        shape:        effective.shape,
        position:     effective.keychainPosition,
        holeDiameter: effective.holeDiameter,
        thickness:    effective.thickness,
        shapeWidth:   effective.width,
        shapeHeight:  effective.height,
      })
      shape = booleans.union(shape, tab)
      shape = booleans.subtract(
        shape,
        buildKeyringHole({
          diameter: effective.holeDiameter,
          thickness: effective.thickness,
          offsetX: holeX,
          offsetY: holeY,
        }),
      )
    } else {
      const [hx, hy] = insideHoleXY(
        effective.shape,
        effective.keychainPosition,
        effective.width,
        effective.height,
        effective.holeDiameter,
      )
      shape = booleans.subtract(
        shape,
        buildKeyringHole({
          diameter: effective.holeDiameter,
          thickness: effective.thickness,
          offsetX: hx,
          offsetY: hy,
        }),
      )
    }
  }

  // ── 3. Text ────────────────────────────────────────────────────────────
  if (effective.text.trim()) {
    const textGeom = applyText(
      effective.text,
      fontSize,
      effective.textMode,
      effective.thickness,
      effective.textReliefDepth,
      safeInsetDepth,
      fontFamily,
    )

    if (textGeom) {
      const textDims   = getTextDimensions(effective.text, fontSize, fontFamily)
      const [tx, ty]   = textDims
        ? computeTextPosition(effective, textDims.width, textDims.height, autoOffsetX, autoOffsetY)
        : [autoOffsetX + effective.textOffsetX, autoOffsetY + effective.textOffsetY]

      const shapeTop    =  effective.thickness / 2
      const shapeBottom = -effective.thickness / 2

      switch (effective.textMode) {
        case 'positive': {
          // Embed TEXT_POSITIVE_EMBED mm into the shape top so the union has a
          // clear interior overlap (avoids coplanar faces in exported STL).
          const p = transforms.translate([tx, ty, shapeTop - TEXT_POSITIVE_EMBED], textGeom)
          shape = booleans.union(shape, p)
          break
        }
        case 'negative': {
          // textGeom has height = safeInsetDepth + CUTTER_OVERCUT.
          // Translating from (shapeTop - safeInsetDepth) puts the cutter top
          // slightly above shapeTop — clean, non-coplanar subtraction.
          const p = transforms.translate([tx, ty, shapeTop - safeInsetDepth], textGeom)
          shape = booleans.subtract(shape, p)
          break
        }
        case 'cutout': {
          // buildCutoutText returns height (thickness + 2).
          // From (shapeBottom - 1) the cutter spans shapeBottom-1 → shapeTop+1.
          const p = transforms.translate([tx, ty, shapeBottom - 1], textGeom)
          shape = booleans.subtract(shape, p)
          break
        }
      }
    }
  }

  return shape
}
