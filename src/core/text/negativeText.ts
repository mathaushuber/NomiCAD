import { extrusions, transforms } from '@jscad/modeling'

/**
 * Extrudes a 2D text geometry to `depth` + epsilon mm.
 * The resulting geometry is used as a cutter to sink text into the surface.
 * In buildModel, this is positioned so its top aligns with the shape surface.
 */
export function buildNegativeText(geom2D: any, depth: number): any {
  const extruded = extrusions.extrudeLinear({ height: depth + 0.1 }, geom2D)
  return transforms.center({ axes: [true, true, false] }, extruded)
}
