import { booleans, transforms } from '@jscad/modeling'
import type { ModelParams, KeychainPosition } from '../parameters/common'
import { extractRectangleParams } from '../parameters/rectangleParams'
import { extractOvalParams } from '../parameters/ovalParams'
import { buildRectangleTag } from '../builders/rectangleTag'
import { buildOvalTag } from '../builders/ovalTag'
import { buildKeyringHole } from '../builders/keyringHole'
import { buildKeychainTab } from '../builders/keychainTab'
import { applyText, getTextDimensions } from '../builders/textModes'
import { validateParams } from './validators'

/** Horizontal padding between text edge and shape edge (each side, mm). */
const H_PAD = 9

/** Vertical padding between text edge and shape edge (each side, mm). */
const V_PAD = 5

// ── Interior hole positioning ──────────────────────────────────────────────

function insideHoleXY(
  position: KeychainPosition,
  width: number,
  height: number,
  holeDiameter: number,
): [number, number] {
  const margin = holeDiameter / 2 + 2
  switch (position) {
    case 'top':    return [0,  height / 2 - margin]
    case 'bottom': return [0, -(height / 2 - margin)]
    case 'left':   return [-(width / 2 - margin), 0]
    case 'right':  return [width / 2 - margin, 0]
  }
}

// ── Effective dimension calculation ────────────────────────────────────────

interface EffectiveDimensions {
  width: number
  height: number
  textOffsetX: number
  textOffsetY: number
}

/**
 * Derives the font size from the user-specified shape dimensions.
 * Computed before any auto-scaling so the text size stays constant and
 * it is the shape that grows to fit.
 */
function deriveFontSize(params: ModelParams): number {
  return Math.min(params.height * 0.32, params.width * 0.1, 9)
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
  const { width, height, textOffsetX, textOffsetY } = computeEffectiveDimensions(params, fontSize)

  // All downstream builders use the effective (possibly expanded) dimensions.
  const effective: ModelParams = { ...params, width, height }

  // ── 1. Base shape ──────────────────────────────────────────────────────
  let shape: any =
    effective.shape === 'rectangle'
      ? buildRectangleTag(extractRectangleParams(effective))
      : buildOvalTag(extractOvalParams(effective))

  // ── 2. Keychain hole ──────────────────────────────────────────────────
  if (effective.isKeychain) {
    if (effective.keychainPlacement === 'outside') {
      // Build the external tab and union it with the shape first, then punch the hole.
      const { tab, holeX, holeY } = buildKeychainTab({
        position:    effective.keychainPosition,
        holeDiameter: effective.holeDiameter,
        thickness:   effective.thickness,
        shapeWidth:  effective.width,
        shapeHeight: effective.height,
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
          const p = transforms.translate([textOffsetX, textOffsetY, shapeTop], textGeom)
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
          const p = transforms.translate([textOffsetX, textOffsetY, shapeBottom - 1], textGeom)
          shape = booleans.subtract(shape, p)
          break
        }
      }
    }
  }

  return shape
}
