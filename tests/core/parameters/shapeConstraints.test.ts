import { describe, it, expect } from 'vitest'
import type { Shape } from '../../../src/core/parameters/common'
import {
  getKeychainConstraint,
  getShapeDefaults,
  normalizeKeychainForShape,
  applyShapeChange,
} from '../../../src/core/parameters/shapeConstraints'
import { makeParams } from '../../helpers/params'

// ── getKeychainConstraint ──────────────────────────────────────────────────

describe('getKeychainConstraint', () => {
  const unconstrained: Shape[] = ['rectangle', 'rounded-rectangle', 'oval', 'circle', 'hexagon']

  it.each(unconstrained)('returns null for unconstrained shape "%s"', (shape) => {
    expect(getKeychainConstraint(shape)).toBeNull()
  })

  describe('triangle', () => {
    it('allows only top and bottom positions', () => {
      const c = getKeychainConstraint('triangle')!
      expect(c.allowedPositions).toEqual(['top', 'bottom'])
      expect(c.allowedPositions).not.toContain('left')
      expect(c.allowedPositions).not.toContain('right')
    })

    it('allows both inside and outside placements', () => {
      const c = getKeychainConstraint('triangle')!
      expect(c.allowedPlacements).toContain('inside')
      expect(c.allowedPlacements).toContain('outside')
    })

    it('defaults to top / outside', () => {
      const c = getKeychainConstraint('triangle')!
      expect(c.defaultPosition).toBe('top')
      expect(c.defaultPlacement).toBe('outside')
    })
  })

  describe('heart', () => {
    it('allows only bottom position', () => {
      const c = getKeychainConstraint('heart')!
      expect(c.allowedPositions).toEqual(['bottom'])
    })

    it('allows only outside placement', () => {
      const c = getKeychainConstraint('heart')!
      expect(c.allowedPlacements).toEqual(['outside'])
    })

    it('defaults to bottom / outside', () => {
      const c = getKeychainConstraint('heart')!
      expect(c.defaultPosition).toBe('bottom')
      expect(c.defaultPlacement).toBe('outside')
    })
  })

  describe('star', () => {
    it('allows only top position', () => {
      const c = getKeychainConstraint('star')!
      expect(c.allowedPositions).toEqual(['top'])
    })

    it('allows only outside placement', () => {
      const c = getKeychainConstraint('star')!
      expect(c.allowedPlacements).toEqual(['outside'])
    })

    it('defaults to top / outside', () => {
      const c = getKeychainConstraint('star')!
      expect(c.defaultPosition).toBe('top')
      expect(c.defaultPlacement).toBe('outside')
    })
  })
})

// ── normalizeKeychainForShape ──────────────────────────────────────────────

describe('normalizeKeychainForShape', () => {
  it('returns the same reference for unconstrained shapes regardless of values', () => {
    const params = makeParams({ shape: 'rectangle', keychainPosition: 'left', keychainPlacement: 'inside' })
    expect(normalizeKeychainForShape(params)).toBe(params)
  })

  it('returns the same reference when values are already valid for the shape', () => {
    const params = makeParams({ shape: 'heart', keychainPosition: 'bottom', keychainPlacement: 'outside' })
    expect(normalizeKeychainForShape(params)).toBe(params)
  })

  describe('triangle snapping', () => {
    it('snaps position "left" to the default "top"', () => {
      const result = normalizeKeychainForShape(
        makeParams({ shape: 'triangle', keychainPosition: 'left', keychainPlacement: 'outside' }),
      )
      expect(result.keychainPosition).toBe('top')
    })

    it('snaps position "right" to the default "top"', () => {
      const result = normalizeKeychainForShape(
        makeParams({ shape: 'triangle', keychainPosition: 'right', keychainPlacement: 'outside' }),
      )
      expect(result.keychainPosition).toBe('top')
    })

    it('preserves valid position "bottom"', () => {
      const params = makeParams({ shape: 'triangle', keychainPosition: 'bottom', keychainPlacement: 'outside' })
      expect(normalizeKeychainForShape(params)).toBe(params)
    })

    it('preserves "inside" placement (allowed for triangle)', () => {
      const params = makeParams({ shape: 'triangle', keychainPosition: 'top', keychainPlacement: 'inside' })
      expect(normalizeKeychainForShape(params)).toBe(params)
    })
  })

  describe('heart snapping', () => {
    it('snaps position "top" to default "bottom"', () => {
      const result = normalizeKeychainForShape(
        makeParams({ shape: 'heart', keychainPosition: 'top', keychainPlacement: 'outside' }),
      )
      expect(result.keychainPosition).toBe('bottom')
    })

    it('snaps placement "inside" to default "outside"', () => {
      const result = normalizeKeychainForShape(
        makeParams({ shape: 'heart', keychainPosition: 'bottom', keychainPlacement: 'inside' }),
      )
      expect(result.keychainPlacement).toBe('outside')
    })

    it('snaps both when both are invalid', () => {
      const result = normalizeKeychainForShape(
        makeParams({ shape: 'heart', keychainPosition: 'top', keychainPlacement: 'inside' }),
      )
      expect(result.keychainPosition).toBe('bottom')
      expect(result.keychainPlacement).toBe('outside')
    })
  })

  describe('star snapping', () => {
    it('snaps position "bottom" to default "top"', () => {
      const result = normalizeKeychainForShape(
        makeParams({ shape: 'star', keychainPosition: 'bottom', keychainPlacement: 'outside' }),
      )
      expect(result.keychainPosition).toBe('top')
    })

    it('snaps placement "inside" to default "outside"', () => {
      const result = normalizeKeychainForShape(
        makeParams({ shape: 'star', keychainPosition: 'top', keychainPlacement: 'inside' }),
      )
      expect(result.keychainPlacement).toBe('outside')
    })
  })

  it('does not mutate the original params object', () => {
    const params = makeParams({ shape: 'heart', keychainPosition: 'top', keychainPlacement: 'inside' })
    normalizeKeychainForShape(params)
    expect(params.keychainPosition).toBe('top')
    expect(params.keychainPlacement).toBe('inside')
  })

  it('preserves all unrelated fields after normalization', () => {
    const params = makeParams({ shape: 'heart', keychainPosition: 'top', text: 'hello', width: 99 })
    const result = normalizeKeychainForShape(params)
    expect(result.text).toBe('hello')
    expect(result.width).toBe(99)
    expect(result.shape).toBe('heart')
  })
})

// ── applyShapeChange ───────────────────────────────────────────────────────

describe('applyShapeChange', () => {
  it('sets the new shape', () => {
    expect(applyShapeChange(makeParams({ shape: 'rectangle' }), 'star').shape).toBe('star')
  })

  it('applies the new shape dimension defaults', () => {
    const result = applyShapeChange(makeParams({ shape: 'rectangle', width: 100, height: 50 }), 'heart')
    expect(result.width).toBe(45)
    expect(result.height).toBe(45)
  })

  it('resets textOffsetX and textOffsetY to 0', () => {
    const result = applyShapeChange(
      makeParams({ shape: 'rectangle', textOffsetX: 15, textOffsetY: -8 }),
      'oval',
    )
    expect(result.textOffsetX).toBe(0)
    expect(result.textOffsetY).toBe(0)
  })

  it('preserves text content', () => {
    expect(applyShapeChange(makeParams({ text: 'hello' }), 'circle').text).toBe('hello')
  })

  it('preserves textMode', () => {
    expect(applyShapeChange(makeParams({ textMode: 'positive' }), 'triangle').textMode).toBe('positive')
  })

  it('preserves textReliefDepth and textInsetDepth', () => {
    const result = applyShapeChange(makeParams({ textReliefDepth: 2.5, textInsetDepth: 1.8 }), 'hexagon')
    expect(result.textReliefDepth).toBe(2.5)
    expect(result.textInsetDepth).toBe(1.8)
  })

  it('preserves fontFamily', () => {
    expect(applyShapeChange(makeParams({ fontFamily: 'stencil' }), 'star').fontFamily).toBe('stencil')
  })

  it('normalizes keychain values when switching to heart', () => {
    const result = applyShapeChange(
      makeParams({ keychainPosition: 'top', keychainPlacement: 'inside' }),
      'heart',
    )
    expect(result.keychainPosition).toBe('bottom')
    expect(result.keychainPlacement).toBe('outside')
  })

  it('normalizes keychain values when switching to star', () => {
    const result = applyShapeChange(
      makeParams({ keychainPosition: 'bottom', keychainPlacement: 'inside' }),
      'star',
    )
    expect(result.keychainPosition).toBe('top')
    expect(result.keychainPlacement).toBe('outside')
  })

  it('normalizes keychain values when switching to triangle (drops lateral position)', () => {
    const result = applyShapeChange(makeParams({ keychainPosition: 'right' }), 'triangle')
    expect(result.keychainPosition).toBe('top')
  })
})

// ── getShapeDefaults ───────────────────────────────────────────────────────

describe('getShapeDefaults', () => {
  const topDefaultShapes: Shape[] = [
    'rectangle', 'rounded-rectangle', 'oval', 'circle', 'triangle', 'hexagon', 'star',
  ]

  it.each(topDefaultShapes)('%s defaults keychainPosition to "top"', (shape) => {
    expect(getShapeDefaults(shape).keychainPosition).toBe('top')
  })

  it('heart defaults keychainPosition to "bottom"', () => {
    expect(getShapeDefaults('heart').keychainPosition).toBe('bottom')
  })

  it.each([...topDefaultShapes, 'heart'] as Shape[])(
    '%s defaults keychainPlacement to "outside"',
    (shape) => {
      expect(getShapeDefaults(shape).keychainPlacement).toBe('outside')
    },
  )

  it('circle has equal width and height defaults', () => {
    const d = getShapeDefaults('circle')
    expect(d.width).toBe(d.height)
  })
})
