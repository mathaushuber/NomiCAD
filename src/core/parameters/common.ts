export type Shape = 'rectangle' | 'oval'

export type TextMode = 'positive' | 'negative' | 'cutout'

export interface ModelParams {
  shape: Shape
  width: number
  height: number
  thickness: number
  isKeychain: boolean
  holeDiameter: number
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
  text: 'NomiCAD',
  textMode: 'negative',
}
