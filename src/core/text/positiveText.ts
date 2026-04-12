import { extrusions, transforms } from '@jscad/modeling'

/**
 * Extrudes a 2D text geometry upward by `raiseHeight` mm.
 * The resulting geometry sits with its bottom at z=0.
 * In buildModel, this is translated to sit on top of the base shape.
 */
export function buildPositiveText(geom2D: any, raiseHeight: number): any {
  const extruded = extrusions.extrudeLinear({ height: raiseHeight }, geom2D)
  return transforms.center({ axes: [true, true, false] }, extruded)
}
