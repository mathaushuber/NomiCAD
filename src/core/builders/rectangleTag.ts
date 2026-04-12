import { primitives, hulls, transforms } from '@jscad/modeling'
import type { RectangleParams } from '../parameters/rectangleParams'

export function buildRectangleTag(params: RectangleParams): any {
  const { width, height, thickness, cornerRadius } = params
  const r = Math.min(cornerRadius, width / 2 - 0.1, height / 2 - 0.1)
  const hw = width / 2 - r
  const hh = height / 2 - r

  const cornerCylinder = (x: number, y: number) =>
    transforms.translate(
      [x, y, 0],
      primitives.cylinder({ radius: r, height: thickness, segments: 32 }),
    )

  return hulls.hull(
    cornerCylinder(-hw, -hh),
    cornerCylinder(hw, -hh),
    cornerCylinder(hw, hh),
    cornerCylinder(-hw, hh),
  )
}
