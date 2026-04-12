import { primitives, transforms } from '@jscad/modeling'

/**
 * How far (mm) the hole cylinder extends beyond each face of the base shape.
 * JSCAD's cylinder primitive is centered at z=0, spanning z = -(h/2) to +(h/2).
 * The shape also spans z = -(t/2) to +(t/2).  If the hole height equals the
 * shape thickness exactly, the top and bottom caps are coplanar, producing
 * non-manifold edges in the boolean subtract.  This constant ensures the hole
 * always protrudes past both faces.
 */
const HOLE_PROTRUSION = 1

export interface KeyringHoleParams {
  diameter: number
  thickness: number
  offsetX: number
  offsetY: number
}

/**
 * Returns a cylinder centered on the shape mid-plane (z=0) that protrudes
 * HOLE_PROTRUSION mm beyond both the top and bottom faces of the shape.
 * Centering at z=0 avoids the coplanar-face condition that caused non-manifold
 * edges when the previous translate-by-(-1) implementation left the hole top
 * flush with the shape top face.
 */
export function buildKeyringHole(params: KeyringHoleParams): any {
  const { diameter, thickness, offsetX, offsetY } = params
  return transforms.translate(
    [offsetX, offsetY, 0],
    primitives.cylinder({
      radius: diameter / 2,
      height: thickness + HOLE_PROTRUSION * 2,
      segments: 32,
    }),
  )
}
