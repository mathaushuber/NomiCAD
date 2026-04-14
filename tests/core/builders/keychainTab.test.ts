import { describe, it, expect } from 'vitest'
import type { Shape, KeychainPosition } from '../../../src/core/parameters/common'
import { shapeEdgeDistance, buildKeychainTab } from '../../../src/core/builders/keychainTab'

// Internal constants (mirrored here for readable assertions):
const OVERLAP = 2.5
const WALL = 3

// ── shapeEdgeDistance ──────────────────────────────────────────────────────

describe('shapeEdgeDistance', () => {
  const nonHexagonShapes: Shape[] = ['rectangle', 'rounded-rectangle', 'oval', 'circle', 'triangle', 'star', 'heart']

  describe('non-hexagon shapes', () => {
    it.each(nonHexagonShapes)('%s: top/bottom returns height/2', (shape) => {
      expect(shapeEdgeDistance(shape, 'top',    60, 30)).toBe(15)
      expect(shapeEdgeDistance(shape, 'bottom', 60, 30)).toBe(15)
    })

    it.each(nonHexagonShapes)('%s: left/right returns width/2', (shape) => {
      expect(shapeEdgeDistance(shape, 'left',  60, 30)).toBe(30)
      expect(shapeEdgeDistance(shape, 'right', 60, 30)).toBe(30)
    })
  })

  describe('hexagon (flat-top) — vertical edges are inset by sin(60°)', () => {
    const FLAT_FACTOR = Math.sqrt(3) / 2

    it('top returns (height/2) × √3/2', () => {
      expect(shapeEdgeDistance('hexagon', 'top', 50, 50)).toBeCloseTo(25 * FLAT_FACTOR, 6)
    })

    it('bottom returns (height/2) × √3/2', () => {
      expect(shapeEdgeDistance('hexagon', 'bottom', 50, 50)).toBeCloseTo(25 * FLAT_FACTOR, 6)
    })

    it('left returns width/2 (vertex reaches bounding box)', () => {
      expect(shapeEdgeDistance('hexagon', 'left', 50, 50)).toBe(25)
    })

    it('right returns width/2', () => {
      expect(shapeEdgeDistance('hexagon', 'right', 50, 50)).toBe(25)
    })
  })

  it('works with asymmetric dimensions (width ≠ height)', () => {
    expect(shapeEdgeDistance('oval', 'top',  80, 40)).toBe(20) // height/2
    expect(shapeEdgeDistance('oval', 'left', 80, 40)).toBe(40) // width/2
  })
})

// ── buildKeychainTab ───────────────────────────────────────────────────────

describe('buildKeychainTab', () => {
  it('returns defined tab geometry with numeric hole coordinates', () => {
    const result = buildKeychainTab({
      shape: 'rectangle', position: 'top', holeDiameter: 5, thickness: 3,
      shapeWidth: 60, shapeHeight: 30,
    })
    expect(result.tab).toBeDefined()
    expect(typeof result.holeX).toBe('number')
    expect(typeof result.holeY).toBe('number')
  })

  describe('hole centre position by direction', () => {
    // For rectangle 60×30 with holeDiameter=5:
    //   tabRadius = min(5/2 + WALL, min(60,30)*0.4) = min(5.5, 12) = 5.5
    //   edge (top/bottom) = 30/2 = 15  → protrusion = 15 + 5.5 - 2.5 = 18
    //   edge (left/right) = 60/2 = 30  → protrusion = 30 + 5.5 - 2.5 = 33
    const base = { shape: 'rectangle' as Shape, holeDiameter: 5, thickness: 3, shapeWidth: 60, shapeHeight: 30 }
    const tabRadius = 5 / 2 + WALL      // 5.5
    const edgeV = 30 / 2               // 15 — vertical (top/bottom)
    const edgeH = 60 / 2               // 30 — horizontal (left/right)
    const protV = edgeV + tabRadius - OVERLAP  // 18
    const protH = edgeH + tabRadius - OVERLAP  // 33

    const cases: [KeychainPosition, number, number][] = [
      ['top',    0,      protV],
      ['bottom', 0,     -protV],
      ['left',  -protH,  0],
      ['right',  protH,  0],
    ]

    it.each(cases)('position "%s" → holeX=%.1f, holeY=%.1f', (position, expectedX, expectedY) => {
      const { holeX, holeY } = buildKeychainTab({ ...base, position })
      expect(holeX).toBeCloseTo(expectedX, 5)
      expect(holeY).toBeCloseTo(expectedY, 5)
    })
  })

  it('holeX is 0 for top and bottom positions (centred horizontally)', () => {
    const base = { shape: 'oval' as Shape, holeDiameter: 5, thickness: 3, shapeWidth: 50, shapeHeight: 30 }
    expect(buildKeychainTab({ ...base, position: 'top' }).holeX).toBe(0)
    expect(buildKeychainTab({ ...base, position: 'bottom' }).holeX).toBe(0)
  })

  it('holeY is 0 for left and right positions (centred vertically)', () => {
    const base = { shape: 'oval' as Shape, holeDiameter: 5, thickness: 3, shapeWidth: 50, shapeHeight: 30 }
    expect(buildKeychainTab({ ...base, position: 'left' }).holeY).toBe(0)
    expect(buildKeychainTab({ ...base, position: 'right' }).holeY).toBe(0)
  })

  it('caps tab radius so it never exceeds 40% of the smaller shape dimension', () => {
    // Large hole on a small shape: tabRadius is capped at min(60,30)*0.4 = 12
    const { holeY } = buildKeychainTab({
      shape: 'rectangle', position: 'top', holeDiameter: 20,
      thickness: 3, shapeWidth: 60, shapeHeight: 30,
    })
    const cappedRadius = 30 * 0.4           // 12
    const edge = 15
    const expectedY = edge + cappedRadius - OVERLAP
    expect(holeY).toBeCloseTo(expectedY, 5)
  })
})
