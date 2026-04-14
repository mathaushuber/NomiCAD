import { describe, it, expect } from 'vitest'
import { measurements } from '@jscad/modeling'
import { buildHeartTag } from '../../../src/core/builders/heartTag'

describe('buildHeartTag', () => {
  it('returns defined geometry', () => {
    expect(buildHeartTag({ width: 45, height: 45, thickness: 3 })).toBeDefined()
  })

  it('scales to exactly fill the requested bounding box', () => {
    // The builder measures the raw parametric curve and scales it to fit
    // exactly within the given width × height before extrusion.
    const geom = buildHeartTag({ width: 45, height: 45, thickness: 3 })
    const [[minX, minY, minZ], [maxX, maxY, maxZ]] = measurements.measureBoundingBox(geom)
    expect(maxX - minX).toBeCloseTo(45, 1)
    expect(maxY - minY).toBeCloseTo(45, 1)
    expect(maxZ - minZ).toBeCloseTo(3, 1)
  })

  it('is centred at the origin on all axes', () => {
    const geom = buildHeartTag({ width: 45, height: 45, thickness: 3 })
    const [[minX, minY, minZ], [maxX, maxY, maxZ]] = measurements.measureBoundingBox(geom)
    expect((minX + maxX) / 2).toBeCloseTo(0, 1)
    expect((minY + maxY) / 2).toBeCloseTo(0, 1)
    expect((minZ + maxZ) / 2).toBeCloseTo(0, 5)
  })

  it('scales correctly to non-square dimensions', () => {
    const geom = buildHeartTag({ width: 60, height: 40, thickness: 5 })
    const [[minX, minY, minZ], [maxX, maxY, maxZ]] = measurements.measureBoundingBox(geom)
    expect(maxX - minX).toBeCloseTo(60, 1)
    expect(maxY - minY).toBeCloseTo(40, 1)
    expect(maxZ - minZ).toBeCloseTo(5, 1)
  })

  it('produces different geometry for different sizes (deterministic scaling)', () => {
    const small = buildHeartTag({ width: 30, height: 30, thickness: 2 })
    const large = buildHeartTag({ width: 80, height: 80, thickness: 4 })
    const [[,, smallMinZ], [,, smallMaxZ]] = measurements.measureBoundingBox(small)
    const [[,, largeMinZ], [,, largeMaxZ]] = measurements.measureBoundingBox(large)
    expect(smallMaxZ - smallMinZ).toBeCloseTo(2, 1)
    expect(largeMaxZ - largeMinZ).toBeCloseTo(4, 1)
  })
})
