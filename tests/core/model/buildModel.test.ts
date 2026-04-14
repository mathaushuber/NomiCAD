import { describe, it, expect } from 'vitest'
import { measurements } from '@jscad/modeling'
import type { Shape } from '../../../src/core/parameters/common'
import { buildModel } from '../../../src/core/model/buildModel'
import { normalizeKeychainForShape } from '../../../src/core/parameters/shapeConstraints'
import { makeParams } from '../../helpers/params'

// ── helpers ────────────────────────────────────────────────────────────────

/** Builds params with text suppressed (faster; avoids font rendering). */
function noText(overrides = {}) {
  return makeParams({ text: '', ...overrides })
}

// ── error handling ─────────────────────────────────────────────────────────

describe('buildModel error handling', () => {
  it('throws when params are invalid', () => {
    expect(() => buildModel(makeParams({ width: 5 }))).toThrow()
  })

  it('includes the validation message in the thrown error', () => {
    expect(() => buildModel(makeParams({ width: 5 }))).toThrow(/Width/)
  })
})

// ── shape coverage ─────────────────────────────────────────────────────────

describe('buildModel shape coverage', () => {
  const shapes: Shape[] = [
    'rectangle', 'rounded-rectangle', 'oval', 'circle',
    'triangle', 'hexagon', 'star', 'heart',
  ]

  it.each(shapes)('builds "%s" without throwing', (shape) => {
    const params = normalizeKeychainForShape(noText({ shape }))
    expect(() => buildModel(params)).not.toThrow()
    expect(buildModel(params)).toBeDefined()
  })
})

// ── keychain placement ─────────────────────────────────────────────────────

describe('buildModel keychain placement', () => {
  it('builds with an outside tab at each cardinal position', () => {
    for (const position of ['top', 'bottom', 'left', 'right'] as const) {
      expect(() =>
        buildModel(noText({ isKeychain: true, keychainPlacement: 'outside', keychainPosition: position })),
      ).not.toThrow()
    }
  })

  it('builds with an inside hole at each cardinal position when the shape is large enough', () => {
    for (const position of ['top', 'bottom', 'left', 'right'] as const) {
      expect(() =>
        buildModel(noText({
          isKeychain: true, keychainPlacement: 'inside', keychainPosition: position,
          width: 60, height: 60,
        })),
      ).not.toThrow()
    }
  })

  it('builds when isKeychain is false (no hole or tab added)', () => {
    expect(() => buildModel(noText({ isKeychain: false }))).not.toThrow()
  })
})

// ── text modes ────────────────────────────────────────────────────────────

describe('buildModel text modes', () => {
  it('builds with positive (raised) text', () => {
    expect(() => buildModel(makeParams({ text: 'A', textMode: 'positive' }))).not.toThrow()
  })

  it('builds with negative (inset) text', () => {
    expect(() => buildModel(makeParams({ text: 'A', textMode: 'negative' }))).not.toThrow()
  })

  it('builds with cutout text', () => {
    expect(() => buildModel(makeParams({ text: 'A', textMode: 'cutout' }))).not.toThrow()
  })

  it('skips the text pipeline when text is empty', () => {
    expect(() => buildModel(noText())).not.toThrow()
  })
})

// ── determinism ───────────────────────────────────────────────────────────

describe('buildModel determinism', () => {
  it('produces the same bounding-box for identical inputs', () => {
    const params = noText()
    const bbox1 = measurements.measureBoundingBox(buildModel(params))
    const bbox2 = measurements.measureBoundingBox(buildModel(params))
    expect(bbox1).toEqual(bbox2)
  })

  it('produces different geometry for different widths', () => {
    const narrow = measurements.measureBoundingBox(buildModel(noText({ width: 40, isKeychain: false })))
    const wide   = measurements.measureBoundingBox(buildModel(noText({ width: 80, isKeychain: false })))
    // Wider shape has a larger X extent
    expect(wide[1][0] - wide[0][0]).toBeGreaterThan(narrow[1][0] - narrow[0][0])
  })
})

// ── integration: shape + constrained keychain ──────────────────────────────

describe('buildModel + shape constraints integration', () => {
  it('builds heart with its only valid configuration (bottom / outside)', () => {
    const params = noText({ shape: 'heart', keychainPosition: 'bottom', keychainPlacement: 'outside' })
    expect(() => buildModel(params)).not.toThrow()
  })

  it('builds star with its only valid configuration (top / outside)', () => {
    const params = noText({ shape: 'star', keychainPosition: 'top', keychainPlacement: 'outside' })
    expect(() => buildModel(params)).not.toThrow()
  })

  it('builds triangle with inside hole at top', () => {
    const params = noText({
      shape: 'triangle', keychainPosition: 'top', keychainPlacement: 'inside',
      width: 60, height: 60,
    })
    expect(() => buildModel(params)).not.toThrow()
  })
})
