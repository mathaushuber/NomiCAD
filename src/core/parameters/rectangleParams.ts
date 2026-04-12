import type { ModelParams } from './common'

export interface RectangleParams {
  width: number
  height: number
  thickness: number
  cornerRadius: number
}

export function extractRectangleParams(params: ModelParams): RectangleParams {
  return {
    width: params.width,
    height: params.height,
    thickness: params.thickness,
    cornerRadius: Math.min(params.height * 0.2, 5),
  }
}
