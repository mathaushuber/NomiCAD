import { extrusions, transforms } from '@jscad/modeling'

/**
 * How far (mm) the negative-text cutter extends above the shape top face.
 * The extra protrusion ensures the cutter top is NOT coplanar with the shape
 * top, which would cause non-manifold edges in the boolean subtract.
 */
const CUTTER_OVERCUT = 0.5

/**
 * Extrudes a 2D text geometry to `depth` + CUTTER_OVERCUT mm.
 * The resulting geometry is used as a cutter to sink text into the surface.
 * In buildModel, this is positioned so its top is CUTTER_OVERCUT mm above
 * the shape top face — ensuring a clean, non-coplanar subtraction.
 */
export function buildNegativeText(geom2D: any, depth: number): any {
  const extruded = extrusions.extrudeLinear({ height: depth + CUTTER_OVERCUT }, geom2D)
  return transforms.center({ axes: [true, true, false] }, extruded)
}
