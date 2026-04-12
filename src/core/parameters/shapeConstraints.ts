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

const SHAPE_KEYCHAIN_CONSTRAINTS: Partial<Record<Shape, ShapeKeychainConstraint>> = {
  // Star: apex at top is the only clean attachment point; concave indentations
  // make left/right/bottom tabs look broken. Inside placement is too shallow.
  star: {
    allowedPlacements: ['outside'],
    allowedPositions:  ['top'],
    defaultPlacement:  'outside',
    defaultPosition:   'top',
  },
  // Heart: concave cleft at the top makes top-position tabs float disconnected.
  // Bottom (sharp tip) is the only clean attachment point.
  heart: {
    allowedPlacements: ['outside'],
    allowedPositions:  ['bottom'],
    defaultPlacement:  'outside',
    defaultPosition:   'bottom',
  },
  // Triangle: left/right would attach to slanted faces with no flat reference;
  // top and bottom work cleanly on horizontal edges.
  triangle: {
    allowedPlacements: ['outside', 'inside'],
    allowedPositions:  ['top', 'bottom'],
    defaultPlacement:  'outside',
    defaultPosition:   'top',
  },
}

// ── Shape defaults ─────────────────────────────────────────────────────────

/** Subset of ModelParams that is reset when the user switches shape. */
export type ShapeDefaults = Pick<ModelParams,
  | 'width' | 'height' | 'thickness' | 'textSize'
  | 'isKeychain' | 'holeDiameter' | 'keychainPosition' | 'keychainPlacement'
>

const SHAPE_DEFAULTS: Record<Shape, ShapeDefaults> = {
  rectangle: {
    width: 60, height: 30, thickness: 3, textSize: 1.0,
    isKeychain: true, holeDiameter: 5, keychainPosition: 'top', keychainPlacement: 'outside',
  },
  'rounded-rectangle': {
    width: 60, height: 30, thickness: 3, textSize: 1.0,
    isKeychain: true, holeDiameter: 5, keychainPosition: 'top', keychainPlacement: 'outside',
  },
  oval: {
    width: 50, height: 30, thickness: 3, textSize: 1.0,
    isKeychain: true, holeDiameter: 5, keychainPosition: 'top', keychainPlacement: 'outside',
  },
  circle: {
    width: 40, height: 40, thickness: 3, textSize: 1.0,
    isKeychain: true, holeDiameter: 5, keychainPosition: 'top', keychainPlacement: 'outside',
  },
  triangle: {
    width: 60, height: 60, thickness: 3, textSize: 1.0,
    isKeychain: true, holeDiameter: 5, keychainPosition: 'top', keychainPlacement: 'outside',
  },
  hexagon: {
    width: 50, height: 50, thickness: 3, textSize: 1.0,
    isKeychain: true, holeDiameter: 5, keychainPosition: 'top', keychainPlacement: 'outside',
  },
  star: {
    width: 55, height: 55, thickness: 3, textSize: 1.0,
    isKeychain: true, holeDiameter: 5, keychainPosition: 'top', keychainPlacement: 'outside',
  },
  heart: {
    width: 45, height: 45, thickness: 3, textSize: 1.0,
    isKeychain: true, holeDiameter: 5, keychainPosition: 'bottom', keychainPlacement: 'outside',
  },
}

// ── Public API ─────────────────────────────────────────────────────────────

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
 * permitted for the shape. For unconstrained shapes the params are returned
 * unchanged.
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
 *  1. Applies the shape's default dimensions / keychain settings.
 *  2. Preserves text content and text mode from the previous params.
 *  3. Normalises keychain placement + position for the new shape.
 */
export function applyShapeChange(prevParams: ModelParams, newShape: Shape): ModelParams {
  const defaults = SHAPE_DEFAULTS[newShape]
  const next: ModelParams = {
    ...prevParams,   // carry over everything (text, textMode, …)
    ...defaults,     // apply new shape's dimension / keychain defaults
    shape: newShape,
    // Explicitly preserve user text — it belongs to the user, not the shape.
    text:     prevParams.text,
    textMode: prevParams.textMode,
  }
  return normalizeKeychainForShape(next)
}
