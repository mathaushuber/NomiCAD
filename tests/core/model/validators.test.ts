import { describe, it, expect } from 'vitest'
import type { Shape } from '../../../src/core/parameters/common'
import { validateParams } from '../../../src/core/model/validators'
import { makeParams } from '../../helpers/params'

// INSIDE_MIN_INTERIOR is 12 mm (internal constant).
// Condition: holeDiameter + 12 > axisDim  →  error
// So minimum valid axisDim for holeDiameter=5 is 17.

describe('validateParams', () => {

  // ── happy path ────────────────────────────────────────────────────────────

  describe('valid input', () => {
    it('returns valid with no errors for default params', () => {
      const result = validateParams(makeParams())
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    const allShapes: Shape[] = [
      'rectangle', 'rounded-rectangle', 'oval', 'circle',
      'triangle', 'hexagon', 'star', 'heart',
    ]
    it.each(allShapes)('accepts every supported shape: "%s"', (shape) => {
      expect(validateParams(makeParams({ shape })).valid).toBe(true)
    })
  })

  // ── shape ─────────────────────────────────────────────────────────────────

  describe('shape', () => {
    it('rejects an unrecognised shape value', () => {
      const result = validateParams(makeParams({ shape: 'pentagon' as Shape }))
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('shape'))).toBe(true)
    })
  })

  // ── dimension ranges ──────────────────────────────────────────────────────

  describe('width', () => {
    it.each([10, 200])('accepts boundary value %d', (width) => {
      expect(validateParams(makeParams({ width })).valid).toBe(true)
    })
    it.each([9, 201])('rejects out-of-range value %d', (width) => {
      expect(validateParams(makeParams({ width })).valid).toBe(false)
    })
  })

  describe('height', () => {
    it.each([10, 200])('accepts boundary value %d', (height) => {
      expect(validateParams(makeParams({ height })).valid).toBe(true)
    })
    it.each([9, 201])('rejects out-of-range value %d', (height) => {
      expect(validateParams(makeParams({ height })).valid).toBe(false)
    })
  })

  describe('thickness', () => {
    it.each([1, 20])('accepts boundary value %d', (thickness) => {
      expect(validateParams(makeParams({ thickness })).valid).toBe(true)
    })
    it.each([0, 21])('rejects out-of-range value %d', (thickness) => {
      expect(validateParams(makeParams({ thickness })).valid).toBe(false)
    })
  })

  describe('textSize', () => {
    it.each([0.1, 3.0])('accepts boundary value %d', (textSize) => {
      expect(validateParams(makeParams({ textSize })).valid).toBe(true)
    })
    it.each([0.09, 3.01])('rejects out-of-range value %d', (textSize) => {
      expect(validateParams(makeParams({ textSize })).valid).toBe(false)
    })
  })

  describe('textReliefDepth', () => {
    it.each([0.1, 20])('accepts boundary value %d', (textReliefDepth) => {
      expect(validateParams(makeParams({ textReliefDepth })).valid).toBe(true)
    })
    it.each([0.09, 21])('rejects out-of-range value %d', (textReliefDepth) => {
      expect(validateParams(makeParams({ textReliefDepth })).valid).toBe(false)
    })
  })

  describe('textInsetDepth', () => {
    it.each([0.1, 20])('accepts boundary value %d', (textInsetDepth) => {
      expect(validateParams(makeParams({ textInsetDepth })).valid).toBe(true)
    })
    it.each([0.09, 21])('rejects out-of-range value %d', (textInsetDepth) => {
      expect(validateParams(makeParams({ textInsetDepth })).valid).toBe(false)
    })
  })

  // ── keychain parameters ───────────────────────────────────────────────────

  describe('keychainPosition', () => {
    it('rejects an invalid position value', () => {
      const result = validateParams(makeParams({ keychainPosition: 'diagonal' as never }))
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('keychainPosition'))).toBe(true)
    })
  })

  describe('keychainPlacement', () => {
    it('rejects an invalid placement value', () => {
      const result = validateParams(makeParams({ keychainPlacement: 'floating' as never }))
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('keychainPlacement'))).toBe(true)
    })
  })

  describe('holeDiameter', () => {
    it.each([2, 15])('accepts boundary value %d when isKeychain=true', (holeDiameter) => {
      expect(validateParams(makeParams({ isKeychain: true, holeDiameter })).valid).toBe(true)
    })
    it.each([1, 16])('rejects out-of-range value %d', (holeDiameter) => {
      expect(validateParams(makeParams({ isKeychain: true, holeDiameter })).valid).toBe(false)
    })
    it('skips hole validation entirely when isKeychain is false', () => {
      // Even an out-of-range diameter is irrelevant when not a keychain
      expect(validateParams(makeParams({ isKeychain: false, holeDiameter: 100 })).valid).toBe(true)
    })
  })

  // ── inside-hole size constraint ───────────────────────────────────────────

  describe('inside hole size constraint', () => {
    // holeDiameter(5) + INSIDE_MIN_INTERIOR(12) = 17
    // axisDim must be >= 17 for the hole to fit

    it('rejects when the shape is too short for a top inside hole', () => {
      const result = validateParams(makeParams({
        isKeychain: true, keychainPlacement: 'inside', keychainPosition: 'top',
        holeDiameter: 5, height: 16,
      }))
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('top'))).toBe(true)
    })

    it('accepts when the shape height exactly fits a top inside hole', () => {
      expect(validateParams(makeParams({
        isKeychain: true, keychainPlacement: 'inside', keychainPosition: 'top',
        holeDiameter: 5, height: 17,
      })).valid).toBe(true)
    })

    it('rejects when the shape is too short for a bottom inside hole', () => {
      expect(validateParams(makeParams({
        isKeychain: true, keychainPlacement: 'inside', keychainPosition: 'bottom',
        holeDiameter: 5, height: 16,
      })).valid).toBe(false)
    })

    it('uses width (not height) for a left inside hole', () => {
      // height large enough, width too small → should fail
      expect(validateParams(makeParams({
        isKeychain: true, keychainPlacement: 'inside', keychainPosition: 'left',
        holeDiameter: 5, width: 16, height: 60,
      })).valid).toBe(false)
    })

    it('uses width for a right inside hole', () => {
      expect(validateParams(makeParams({
        isKeychain: true, keychainPlacement: 'inside', keychainPosition: 'right',
        holeDiameter: 5, width: 16, height: 60,
      })).valid).toBe(false)
    })

    it('accepts when width is large enough for a left inside hole', () => {
      expect(validateParams(makeParams({
        isKeychain: true, keychainPlacement: 'inside', keychainPosition: 'left',
        holeDiameter: 5, width: 17, height: 60,
      })).valid).toBe(true)
    })

    it('does not apply the inside-hole check for outside placement', () => {
      // Shape would be too small for inside, but placement is outside — should pass
      expect(validateParams(makeParams({
        isKeychain: true, keychainPlacement: 'outside', keychainPosition: 'top',
        holeDiameter: 5, height: 12,
      })).valid).toBe(true)
    })
  })

  // ── error accumulation ────────────────────────────────────────────────────

  describe('error accumulation', () => {
    it('reports multiple independent errors at once', () => {
      const result = validateParams(makeParams({ width: 5, height: 5, thickness: 0 }))
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(3)
    })
  })
})
