import { extrusions, transforms } from '@jscad/modeling'

/**
 * Extrudes a 2D text geometry tall enough to pierce the full shape thickness.
 * In buildModel, this is positioned to span from below the bottom face to above the top face.
 */
export function buildCutoutText(geom2D: any, thickness: number): any {
  const extruded = extrusions.extrudeLinear({ height: thickness + 2 }, geom2D)
  return transforms.center({ axes: [true, true, false] }, extruded)
}
