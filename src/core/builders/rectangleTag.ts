import { primitives, hulls, transforms } from '@jscad/modeling'
import type { RectangleParams } from '../parameters/rectangleParams'

/**
 * Builds a rounded-rectangle tag using the convex hull of four corner cylinders.
 * Each cylinder is centered at z=0, so the resulting hull spans
 * z = -(thickness/2) to z = +(thickness/2), matching every other shape builder.
 *
 * cornerRadius is clamped to keep at least 0.1 mm of flat face on each side
 * so the corner cylinders never produce degenerate zero-radius geometry.
 */
export function buildRectangleTag(params: RectangleParams): any {
  const { width, height, thickness, cornerRadius } = params
  const r  = Math.max(0.5, Math.min(cornerRadius, width / 2 - 0.1, height / 2 - 0.1))
  const hw = width  / 2 - r
  const hh = height / 2 - r

  // cylinders are centered at z=0 by JSCAD's default — spans z=-(t/2) to z=+(t/2)
  const corner = (x: number, y: number) =>
    transforms.translate(
      [x, y, 0],
      primitives.cylinder({ radius: r, height: thickness, segments: 32 }),
    )

  return hulls.hull(
    corner(-hw, -hh),
    corner( hw, -hh),
    corner( hw,  hh),
    corner(-hw,  hh),
  )
}
