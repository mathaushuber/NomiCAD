import { primitives, transforms } from '@jscad/modeling'

export interface KeyringHoleParams {
  diameter: number
  thickness: number
  offsetX: number
  offsetY: number
}

export function buildKeyringHole(params: KeyringHoleParams): any {
  const { diameter, thickness, offsetX, offsetY } = params
  return transforms.translate(
    [offsetX, offsetY, -1],
    primitives.cylinder({ radius: diameter / 2, height: thickness + 2, segments: 32 }),
  )
}
