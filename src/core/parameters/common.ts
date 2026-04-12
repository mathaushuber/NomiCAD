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
}
