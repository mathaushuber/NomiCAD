import type { Shape, KeychainPosition, KeychainPlacement, ModelParams } from './common'

// ── Keychain constraint types ──────────────────────────────────────────────

export interface ShapeKeychainConstraint {
  /** Placements shown in the UI and accepted by the validator. */
  allowedPlacements: KeychainPlacement[]
  /** Positions shown in the UI and accepted by the validator. */
  allowedPositions: KeychainPosition[]
  /** Fallback used when the current placement is not in allowedPlacements. */
  defaultPlacement: KeychainPlacement
  /** Fallback used when the current position is not in allowedPositions. */
  defaultPosition: KeychainPosition
}

/**
 * Per-shape keychain constraints.
 *
 * Triangle – only vertical positions (top/bottom); left/right tabs look
 *   misaligned on a triangle's slanted sides.  Both inside and outside
 *   placements are permitted.
 *
 * Heart – the only natural attachment point is the bottom tip, and only an
 *   external (outside) tab is allowed there; an inside hole at the tip would
 *   pierce through too little material.  Top position is not permitted because
 *   the heart's concave notch makes the geometry awkward.
 *
 * Star – only the top point makes a clean external tab; bottom looks inverted
 *   and inside holes at any point leave too little material between the arms.
 */
const SHAPE_KEYCHAIN_CONSTRAINTS: Partial<Record<Shape, ShapeKeychainConstraint>> = {
  triangle: {
    allowedPositions: ['top', 'bottom'],
    allowedPlacements: ['inside', 'outside'],
    defaultPosition:  'top',
    defaultPlacement: 'outside',
  },
  heart: {
    allowedPositions: ['bottom'],
    allowedPlacements: ['outside'],
    defaultPosition:  'bottom',
    defaultPlacement: 'outside',
  },
  star: {
    allowedPositions: ['top'],
    allowedPlacements: ['outside'],
    defaultPosition:  'top',
    defaultPlacement: 'outside',
  },
}

// ── Shape defaults ────────────────────────────────���────────────────────────

/**
 * Subset of ModelParams that is reset when the user switches shape.
 * textOffsetX/Y are included so they reset to 0 when the shape (and therefore
 * the coordinate space) changes.  textReliefDepth/textInsetDepth are NOT
 * included — they are style preferences preserved across shape changes.
 */
// fontFamily intentionally excluded from ShapeDefaults so the user's chosen
// font persists across shape changes — it's a style preference, not a shape property.
export type ShapeDefaults = Pick<ModelParams,
  | 'width' | 'height' | 'thickness' | 'textSize'
  | 'isKeychain' | 'holeDiameter' | 'keychainPosition' | 'keychainPlacement'
  | 'textOffsetX' | 'textOffsetY'
>

const SHAPE_DEFAULTS: Record<Shape, ShapeDefaults> = {
  rectangle: {
    width: 60, height: 30, thickness: 3, textSize: 1.0,
    isKeychain: true, holeDiameter: 5, keychainPosition: 'top', keychainPlacement: 'outside',
    textOffsetX: 0, textOffsetY: 0,
  },
  'rounded-rectangle': {
    width: 60, height: 30, thickness: 3, textSize: 1.0,
    isKeychain: true, holeDiameter: 5, keychainPosition: 'top', keychainPlacement: 'outside',
    textOffsetX: 0, textOffsetY: 0,
  },
  oval: {
    width: 50, height: 30, thickness: 3, textSize: 1.0,
    isKeychain: true, holeDiameter: 5, keychainPosition: 'top', keychainPlacement: 'outside',
    textOffsetX: 0, textOffsetY: 0,
  },
  circle: {
    width: 40, height: 40, thickness: 3, textSize: 1.0,
    isKeychain: true, holeDiameter: 5, keychainPosition: 'top', keychainPlacement: 'outside',
    textOffsetX: 0, textOffsetY: 0,
  },
  triangle: {
    width: 60, height: 60, thickness: 3, textSize: 0.4,
    isKeychain: true, holeDiameter: 5, keychainPosition: 'top', keychainPlacement: 'outside',
    textOffsetX: 0, textOffsetY: 0,
  },
  hexagon: {
    width: 50, height: 50, thickness: 3, textSize: 1.0,
    isKeychain: true, holeDiameter: 5, keychainPosition: 'top', keychainPlacement: 'outside',
    textOffsetX: 0, textOffsetY: 0,
  },
  star: {
    width: 55, height: 55, thickness: 3, textSize: 0.4,
    isKeychain: true, holeDiameter: 5, keychainPosition: 'top', keychainPlacement: 'outside',
    textOffsetX: 0, textOffsetY: 0,
  },
  heart: {
    width: 45, height: 45, thickness: 3, textSize: 0.7,
    isKeychain: true, holeDiameter: 5, keychainPosition: 'bottom', keychainPlacement: 'outside',
    textOffsetX: 0, textOffsetY: 0,
  },
}

// ── Public API ─────────────────────────────��───────────────────────────────

/** Returns the keychain constraint for a shape, or null if unrestricted. */
export function getKeychainConstraint(shape: Shape): ShapeKeychainConstraint | null {
  return SHAPE_KEYCHAIN_CONSTRAINTS[shape] ?? null
}

/** Returns the default parameter values for a shape. */
export function getShapeDefaults(shape: Shape): ShapeDefaults {
  return SHAPE_DEFAULTS[shape]
}

/**
 * Normalises keychainPlacement / keychainPosition to values that are
 * permitted for the shape.  With no constraints defined this is always a
 * no-op, but the function is kept for API stability.
 */
export function normalizeKeychainForShape(params: ModelParams): ModelParams {
  const c = getKeychainConstraint(params.shape)
  if (!c) return params

  const placement = c.allowedPlacements.includes(params.keychainPlacement)
    ? params.keychainPlacement
    : c.defaultPlacement

  const position = c.allowedPositions.includes(params.keychainPosition)
    ? params.keychainPosition
    : c.defaultPosition

  if (placement === params.keychainPlacement && position === params.keychainPosition) {
    return params
  }

  return { ...params, keychainPlacement: placement, keychainPosition: position }
}

/**
 * Builds the full params object for a shape change:
 *  1. Applies the shape's default dimensions / keychain / text-offset settings.
 *  2. Preserves text content, text mode, and text depth preferences.
 *  3. Normalises keychain placement + position (no-op with no constraints).
 */
export function applyShapeChange(prevParams: ModelParams, newShape: Shape): ModelParams {
  const defaults = SHAPE_DEFAULTS[newShape]
  const next: ModelParams = {
    ...prevParams,            // carry over everything
    ...defaults,              // apply new shape's dimension / keychain / offset defaults
    shape: newShape,
    // Preserve user content and style choices across shape changes.
    text:             prevParams.text,
    textMode:         prevParams.textMode,
    textReliefDepth:  prevParams.textReliefDepth,
    textInsetDepth:   prevParams.textInsetDepth,
    fontFamily:       prevParams.fontFamily,
  }
  return normalizeKeychainForShape(next)
}
