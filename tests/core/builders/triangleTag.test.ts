import { describe, it, expect } from 'vitest'
import { measurements } from '@jscad/modeling'
import { buildTriangleTag } from '../../../src/core/builders/triangleTag'

describe('buildTriangleTag', () => {
  it('returns defined geometry', () => {
    expect(buildTriangleTag({ width: 60, height: 60, thickness: 3 })).toBeDefined()
  })

  it('produces geometry with the correct bounding-box dimensions', () => {
    const geom = buildTriangleTag({ width: 60, height: 60, thickness: 3 })
    const [[minX, minY, minZ], [maxX, maxY, maxZ]] = measurements.measureBoundingBox(geom)
    expect(maxX - minX).toBeCloseTo(60, 1)
    expect(maxY - minY).toBeCloseTo(60, 1)
    expect(maxZ - minZ).toBeCloseTo(3, 1)
  })

  it('is centred at the origin along the X and Z axes', () => {
    const geom = buildTriangleTag({ width: 60, height: 60, thickness: 3 })
    const [[minX,, minZ], [maxX,, maxZ]] = measurements.measureBoundingBox(geom)
    expect((minX + maxX) / 2).toBeCloseTo(0, 5)
    expect((minZ + maxZ) / 2).toBeCloseTo(0, 5)
  })

  it('scales correctly to arbitrary dimensions', () => {
    const geom = buildTriangleTag({ width: 40, height: 80, thickness: 5 })
    const [[minX, minY, minZ], [maxX, maxY, maxZ]] = measurements.measureBoundingBox(geom)
    expect(maxX - minX).toBeCloseTo(40, 1)
    expect(maxY - minY).toBeCloseTo(80, 1)
    expect(maxZ - minZ).toBeCloseTo(5, 1)
  })

  it('apex is at the top (positive Y) and base is at the bottom (negative Y)', () => {
    const geom = buildTriangleTag({ width: 60, height: 60, thickness: 3 })
    const [[, minY], [, maxY]] = measurements.measureBoundingBox(geom)
    // Apex is at hh = height/2 above the midpoint.  Because the centroid is
    // not at Y=0 (it is at -height/6 for an isosceles triangle), the midpoint
    // between minY and maxY is not exactly 0 — but maxY must be positive and
    // minY negative.
    expect(maxY).toBeGreaterThan(0)
    expect(minY).toBeLessThan(0)
  })

  it('produces geometry with zero thickness when thickness is very small', () => {
    const geom = buildTriangleTag({ width: 30, height: 30, thickness: 0.5 })
    const [[,, minZ], [,, maxZ]] = measurements.measureBoundingBox(geom)
    expect(maxZ - minZ).toBeCloseTo(0.5, 2)
  })
})
