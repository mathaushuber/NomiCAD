import { primitives, extrusions, transforms } from '@jscad/modeling'

export interface HexagonParams {
  width: number
  height: number
  thickness: number
}

/**
 * Builds a flat-top hexagon tag scaled to fit the given width × height bounding box.
 * The geometry is centered at the origin on all three axes.
 */
export function buildHexagonTag({ width, height, thickness }: HexagonParams): any {
  // Flat-top orientation: first vertex at angle 0° (right side).
  const points: [number, number][] = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i
    return [Math.cos(angle) * (width / 2), Math.sin(angle) * (height / 2)]
  })

  const polygon = primitives.polygon({ points })
  const extruded = extrusions.extrudeLinear({ height: thickness }, polygon)
  return transforms.translate([0, 0, -thickness / 2], extruded)
}
