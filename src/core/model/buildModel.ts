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

/** Horizontal padding between text edge and shape edge (each side, mm). */
const H_PAD = 9

/** Vertical padding between text edge and shape edge (each side, mm). */
const V_PAD = 5

/**
 * How far (mm) positive text geometry is embedded below the shape top face
 * before the union.  Must be large enough that JSCAD and downstream slicers
 * do not treat the two surfaces as coplanar.  0.01 mm falls within typical
 * slicer vertex-merge tolerances and caused non-manifold faces in exported STL.
 */
const TEXT_POSITIVE_EMBED = 0.2

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
  textOffsetX: number
  textOffsetY: number
}

/** Minimum safe font size for JSCAD geometry (mm). Below this, geometry becomes degenerate. */
const MIN_FONT_SIZE = 0.1

/**
 * Derives the effective font size by combining the auto-fit base size with
 * the user's `textSize` multiplier.
 *
 * Base size is proportional to the shape dimensions so that the default
 * (textSize = 1.0) always produces well-fitting text. `textSize` then scales
 * that base up or down. The result is clamped to MIN_FONT_SIZE to keep
 * geometry valid at very small multipliers.
 */
function deriveFontSize(params: ModelParams): number {
  const base = Math.min(params.height * 0.32, params.width * 0.1, 9)
  const clamped = Math.max(0.3, Math.min(3.0, params.textSize))
  return Math.max(MIN_FONT_SIZE, base * clamped)
}

/**
 * Returns the effective shape dimensions needed to contain the text with
 * consistent padding, and the XY offset that keeps text centred inside the
 * usable region (the area not occupied by an inside keyring hole).
 *
 * Outside-placement holes do not consume interior space — the full interior
 * is available for text in that case.
 */
function computeEffectiveDimensions(params: ModelParams, fontSize: number): EffectiveDimensions {
  const { width, height, isKeychain, holeDiameter, keychainPosition, keychainPlacement } = params

  // Only inside-placement holes eat into the usable interior.
  const insideHole = isKeychain && keychainPlacement === 'inside'
  const holeReserve = insideHole ? holeDiameter + 6 : 0

  const isVertical = keychainPosition === 'top' || keychainPosition === 'bottom'
  const verticalReserve = isVertical ? holeReserve : 0
  const horizontalReserve = isVertical ? 0 : holeReserve

  // Text-centre offset shifts text into the hole-free region.
  // e.g. top-inside hole → shift text down by half the reserved band.
  const textOffsetY =
    keychainPosition === 'top' ? -(verticalReserve / 2) :
    keychainPosition === 'bottom' ? verticalReserve / 2 : 0

  const textOffsetX =
    keychainPosition === 'left' ? horizontalReserve / 2 :
    keychainPosition === 'right' ? -(horizontalReserve / 2) : 0

  if (!params.text.trim()) {
    return { width, height, textOffsetX, textOffsetY }
  }

  const dims = getTextDimensions(params.text, fontSize)
  if (!dims) {
    return { width, height, textOffsetX, textOffsetY }
  }

  const minWidth  = dims.width  + H_PAD * 2 + horizontalReserve
  const minHeight = dims.height + V_PAD * 2 + verticalReserve

  return {
    width:       Math.max(width,  minWidth),
    height:      Math.max(height, minHeight),
    textOffsetX,
    textOffsetY,
  }
}

// ── Public builder ─────────────────────────────────────────────────────────

export function buildModel(params: ModelParams): any {
  const validation = validateParams(params)
  if (!validation.valid) {
    throw new Error(`Invalid parameters:\n${validation.errors.join('\n')}`)
  }

  const fontSize = deriveFontSize(params)
  let { width, height, textOffsetX, textOffsetY } = computeEffectiveDimensions(params, fontSize)

  // Circle must stay equilateral: expand to the larger effective dimension.
  if (params.shape === 'circle') {
    const dim = Math.max(width, height)
    width  = dim
    height = dim
  }

  // All downstream builders use the effective (possibly expanded) dimensions.
  const effective: ModelParams = { ...params, width, height }

  // ── 1. Base shape ──────────────────────────────────────────────────────
  let shape: any
  switch (effective.shape) {
    case 'rectangle':
      shape = buildRectangleTag(extractRectangleParams(effective))
      break
    case 'rounded-rectangle':
      shape = buildRectangleTag({
        ...extractRectangleParams(effective),
        // Use 25 % of the smaller dimension for a distinctly rounder look.
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
      // Build the external tab and union it with the shape first, then punch the hole.
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
      // Inside: place the hole directly within the shape.
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
    )

    if (textGeom) {
      const shapeTop    =  effective.thickness / 2
      const shapeBottom = -effective.thickness / 2

      switch (effective.textMode) {
        case 'positive': {
          // Embed TEXT_POSITIVE_EMBED mm into the shape so the text base is
          // clearly interior — not coplanar with the shape top face.
          const p = transforms.translate([textOffsetX, textOffsetY, shapeTop - TEXT_POSITIVE_EMBED], textGeom)
          shape = booleans.union(shape, p)
          break
        }
        case 'negative': {
          const depth = Math.min(1.5, effective.thickness * 0.45)
          const p = transforms.translate([textOffsetX, textOffsetY, shapeTop - depth], textGeom)
          shape = booleans.subtract(shape, p)
          break
        }
        case 'cutout': {
          // buildCutoutText returns geometry of height (thickness + 2).
          // Translating from (shapeBottom - 1) places it from shapeBottom-1
          // to shapeTop+1, protruding 1 mm past each face — matching the
          // CUTTER_PROTRUSION constant in cutoutText.ts.
          const p = transforms.translate([textOffsetX, textOffsetY, shapeBottom - 1], textGeom)
          shape = booleans.subtract(shape, p)
          break
        }
      }
    }
  }

  return shape
}
