import { describe, it, expect } from 'vitest'
import { measurements } from '@jscad/modeling'
import { buildStarTag } from '../../../src/core/builders/starTag'

// A 5-pointed star starting at the top (π/2) has an asymmetric bounding box:
//   • maxY  = outerRy  (top vertex sits exactly at the outer ellipse top)
//   • minY  ≈ -outerRy × sin(54°)  ≈ -0.809 × outerRy
//   • maxX  = outerRx × cos(18°)   ≈  0.951 × outerRx  (right vertex)
//   • minX  = -outerRx × cos(18°)  (symmetric in X)
// The bounding box is therefore smaller than outerRx × outerRy on three sides.
const COS_18 = Math.cos(Math.PI / 10)        // ≈ 0.9511
const SIN_54 = Math.sin((3 * Math.PI) / 10)  // ≈ 0.8090

describe('buildStarTag', () => {
  it('returns defined geometry', () => {
    expect(buildStarTag({ width: 55, height: 55, thickness: 3 })).toBeDefined()
  })

  it('has the correct thickness (Z extent)', () => {
    const geom = buildStarTag({ width: 55, height: 55, thickness: 3 })
    const [[,, minZ], [,, maxZ]] = measurements.measureBoundingBox(geom)
    expect(maxZ - minZ).toBeCloseTo(3, 1)
  })

  it('is centred at the origin along Z', () => {
    const geom = buildStarTag({ width: 55, height: 55, thickness: 3 })
    const [[,, minZ], [,, maxZ]] = measurements.measureBoundingBox(geom)
    expect((minZ + maxZ) / 2).toBeCloseTo(0, 5)
  })

  it('is symmetric about X=0 (left-right balanced)', () => {
    const geom = buildStarTag({ width: 55, height: 55, thickness: 3 })
    const [[minX], [maxX]] = measurements.measureBoundingBox(geom)
    expect((minX + maxX) / 2).toBeCloseTo(0, 1)
  })

  it('top vertex reaches the outer-Y boundary (star points upward)', () => {
    const outerRy = 55 / 2
    const geom = buildStarTag({ width: 55, height: 55, thickness: 3 })
    const [[, minY], [, maxY]] = measurements.measureBoundingBox(geom)
    expect(maxY).toBeCloseTo(outerRy, 1)
    // Bottom of bounding box sits at ≈ -outerRy × sin(54°)
    expect(minY).toBeCloseTo(-outerRy * SIN_54, 1)
  })

  it('X extent matches outer radius × cos(18°)', () => {
    const outerRx = 55 / 2
    const geom = buildStarTag({ width: 55, height: 55, thickness: 3 })
    const [[minX], [maxX]] = measurements.measureBoundingBox(geom)
    expect(maxX - minX).toBeCloseTo(outerRx * COS_18 * 2, 1)
  })

  it('scales X and Y extents proportionally with requested dimensions', () => {
    const geom = buildStarTag({ width: 40, height: 60, thickness: 4 })
    const [[minX, minY, minZ], [maxX, maxY, maxZ]] = measurements.measureBoundingBox(geom)
    expect(maxX - minX).toBeCloseTo(40 / 2 * COS_18 * 2, 1)
    expect(maxY).toBeCloseTo(60 / 2, 1)
    expect(minY).toBeCloseTo(-(60 / 2) * SIN_54, 1)
    expect(maxZ - minZ).toBeCloseTo(4, 1)
  })
})
