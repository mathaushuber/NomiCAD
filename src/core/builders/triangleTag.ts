import { primitives, extrusions, transforms } from '@jscad/modeling'

export interface TriangleParams {
  width: number
  height: number
  thickness: number
}

/**
 * Builds an isosceles triangle tag: base along the bottom, apex at the top.
 * The geometry is centered at the origin on all three axes.
 */
export function buildTriangleTag({ width, height, thickness }: TriangleParams): any {
  const hw = width / 2
  const hh = height / 2

  const points: [number, number][] = [
    [-hw, -hh],
    [ hw, -hh],
    [  0,  hh],
  ]

  const polygon = primitives.polygon({ points })
  const extruded = extrusions.extrudeLinear({ height: thickness }, polygon)
  return transforms.translate([0, 0, -thickness / 2], extruded)
}
