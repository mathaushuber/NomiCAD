import { primitives, extrusions, transforms } from '@jscad/modeling'

export interface HeartParams {
  width: number
  height: number
  thickness: number
}

/**
 * Builds a heart-shaped tag using the classic parametric heart curve:
 *   x(t) = 16 sin³(t)
 *   y(t) = 13 cos(t) − 5 cos(2t) − 2 cos(3t) − cos(4t)
 *
 * The raw curve is measured, centered, and scaled to fit exactly inside the
 * requested width × height bounding box before extrusion.
 * The geometry is centered at the origin on all three axes.
 */
export function buildHeartTag({ width, height, thickness }: HeartParams): any {
  const NUM_SEGMENTS = 64

  // Sample the parametric curve.
  const raw: [number, number][] = Array.from({ length: NUM_SEGMENTS }, (_, i) => {
    const t = (2 * Math.PI * i) / NUM_SEGMENTS
    const s = Math.sin(t)
    const x = 16 * s * s * s
    const y =
      13 * Math.cos(t) -
       5 * Math.cos(2 * t) -
       2 * Math.cos(3 * t) -
           Math.cos(4 * t)
    return [x, y]
  })

  // Measure bounding box for centering and scaling.
  const minX = raw.reduce((m, p) => Math.min(m, p[0]), Infinity)
  const maxX = raw.reduce((m, p) => Math.max(m, p[0]), -Infinity)
  const minY = raw.reduce((m, p) => Math.min(m, p[1]), Infinity)
  const maxY = raw.reduce((m, p) => Math.max(m, p[1]), -Infinity)

  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const scaleX = width  / (maxX - minX)
  const scaleY = height / (maxY - minY)

  const points: [number, number][] = raw.map(([x, y]) => [
    (x - cx) * scaleX,
    (y - cy) * scaleY,
  ])

  const polygon = primitives.polygon({ points })
  const extruded = extrusions.extrudeLinear({ height: thickness }, polygon)
  return transforms.translate([0, 0, -thickness / 2], extruded)
}
