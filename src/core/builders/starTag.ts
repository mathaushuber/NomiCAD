import { primitives, extrusions, transforms } from '@jscad/modeling'

export interface StarParams {
  width: number
  height: number
  thickness: number
}

/**
 * Builds a 5-pointed star tag with the top point facing up.
 * Outer vertices sit on the width × height ellipse; inner vertices at 40% of
 * those radii, giving a classic star proportion.
 * The geometry is centered at the origin on all three axes.
 */
export function buildStarTag({ width, height, thickness }: StarParams): any {
  const NUM_POINTS = 5
  const outerRx = width  / 2
  const outerRy = height / 2
  const innerRx = outerRx * 0.4
  const innerRy = outerRy * 0.4

  const points: [number, number][] = []
  for (let i = 0; i < NUM_POINTS * 2; i++) {
    // Start at the top (−π/2) and step by π/NUM_POINTS.
    const angle = (Math.PI * i) / NUM_POINTS - Math.PI / 2
    const rx = i % 2 === 0 ? outerRx : innerRx
    const ry = i % 2 === 0 ? outerRy : innerRy
    points.push([rx * Math.cos(angle), ry * Math.sin(angle)])
  }

  const polygon = primitives.polygon({ points })
  const extruded = extrusions.extrudeLinear({ height: thickness }, polygon)
  return transforms.translate([0, 0, -thickness / 2], extruded)
}
