export type Shape =
  | 'rectangle'
  | 'rounded-rectangle'
  | 'oval'
  | 'circle'
  | 'triangle'
  | 'hexagon'
  | 'star'
  | 'heart'

export type TextMode = 'positive' | 'negative' | 'cutout'

export type KeychainPosition = 'top' | 'bottom' | 'left' | 'right'

export type KeychainPlacement = 'inside' | 'outside'

export interface ModelParams {
  shape: Shape
  width: number
  height: number
  thickness: number
  isKeychain: boolean
  holeDiameter: number
  keychainPosition: KeychainPosition
  keychainPlacement: KeychainPlacement
  text: string
  textMode: TextMode
  /**
   * Multiplier applied to the auto-derived font size.
   * 1.0 = default auto-fit size. Valid range: 0.3 – 3.0.
   */
  textSize: number
  /**
   * User-defined additional horizontal text offset (mm).
   * 0 = auto-centered (or hole-avoidance baseline).
   * Positive = right, negative = left. Clamped to shape bounds at build time.
   */
  textOffsetX: number
  /**
   * User-defined additional vertical text offset (mm).
   * 0 = auto-centered (or hole-avoidance baseline).
   * Positive = up, negative = down. Clamped to shape bounds at build time.
   */
  textOffsetY: number
  /**
   * Height of raised text above the shape surface in positive (raised) mode (mm).
   */
  textReliefDepth: number
  /**
   * Depth of engraved pocket in negative (inset) mode (mm).
   * Clamped to a safe fraction of thickness at build time.
   */
  textInsetDepth: number
}

export const DEFAULT_PARAMS: ModelParams = {
  shape: 'rectangle',
  width: 60,
  height: 30,
  thickness: 3,
  isKeychain: true,
  holeDiameter: 5,
  keychainPosition: 'top',
  keychainPlacement: 'outside',
  text: 'NomiCAD',
  textMode: 'negative',
  textSize: 1.0,
  textOffsetX: 0,
  textOffsetY: 0,
  textReliefDepth: 1.2,
  textInsetDepth: 1.2,
}
