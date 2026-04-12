import { primitives, extrusions, transforms } from '@jscad/modeling'
import type { OvalParams } from '../parameters/ovalParams'

/**
 * Number of polygon segments used to approximate the ellipse.
 * Higher values produce smoother curves at the cost of more triangles.
 */
const SEGMENTS = 64

/**
 * Builds an oval (elliptic cylinder) tag scaled to the given width × height
 * bounding box.  The geometry is centered at the origin on all three axes.
 *
 * The ellipse is sampled directly — not via scale-transform on a circle —
 * to guarantee uniform vertex distribution and avoid the thin-sliver faces
 * that scale-distorted cylinders produce on elongated ovals.
 */
export function buildOvalTag(params: OvalParams): any {
  const { width, height, thickness } = params
  const rx = width  / 2
  const ry = height / 2

  const points: [number, number][] = Array.from({ length: SEGMENTS }, (_, i) => {
    const angle = (2 * Math.PI * i) / SEGMENTS
    return [rx * Math.cos(angle), ry * Math.sin(angle)]
  })

  const polygon = primitives.polygon({ points })
  const extruded = extrusions.extrudeLinear({ height: thickness }, polygon)
  return transforms.translate([0, 0, -thickness / 2], extruded)
}
