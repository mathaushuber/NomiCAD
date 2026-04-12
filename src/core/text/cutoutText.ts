import { extrusions, transforms } from '@jscad/modeling'

/**
 * How far (mm) the cutout cutter extends beyond each face of the shape.
 * Must be large enough that neither cap is coplanar with the shape faces.
 */
const CUTTER_PROTRUSION = 1

/**
 * Extrudes a 2D text geometry tall enough to pierce the full shape thickness.
 * In buildModel, this is positioned to span from CUTTER_PROTRUSION mm below the
 * bottom face to CUTTER_PROTRUSION mm above the top face — ensuring a clean,
 * non-coplanar subtraction on both ends.
 */
export function buildCutoutText(geom2D: any, thickness: number): any {
  const extruded = extrusions.extrudeLinear({ height: thickness + CUTTER_PROTRUSION * 2 }, geom2D)
  return transforms.center({ axes: [true, true, false] }, extruded)
}
