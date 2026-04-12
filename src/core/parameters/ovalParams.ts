import type { ModelParams } from './common'

export interface OvalParams {
  width: number
  height: number
  thickness: number
}

export function extractOvalParams(params: ModelParams): OvalParams {
  return {
    width: params.width,
    height: params.height,
    thickness: params.thickness,
  }
}
