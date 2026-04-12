import type { ModelParams, Shape, KeychainPosition, KeychainPlacement } from '../parameters/common'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

const VALID_SHAPES: Shape[] = [
  'rectangle', 'rounded-rectangle', 'oval', 'circle',
  'triangle', 'hexagon', 'star', 'heart',
]
const VALID_POSITIONS: KeychainPosition[] = ['top', 'bottom', 'left', 'right']
const VALID_PLACEMENTS: KeychainPlacement[] = ['inside', 'outside']

/** Minimum usable interior on the relevant axis for an inside hole (mm). */
const INSIDE_MIN_INTERIOR = 12

export function validateParams(params: ModelParams): ValidationResult {
  const errors: string[] = []

  if (!VALID_SHAPES.includes(params.shape)) {
    errors.push(`shape must be one of: ${VALID_SHAPES.join(', ')}`)
  }

  if (params.width < 10 || params.width > 200) {
    errors.push('Width must be between 10 and 200 mm')
  }

  if (params.height < 10 || params.height > 200) {
    errors.push('Height must be between 10 and 200 mm')
  }

  if (params.thickness < 1 || params.thickness > 20) {
    errors.push('Thickness must be between 1 and 20 mm')
  }

  if (!VALID_POSITIONS.includes(params.keychainPosition)) {
    errors.push(`keychainPosition must be one of: ${VALID_POSITIONS.join(', ')}`)
  }

  if (!VALID_PLACEMENTS.includes(params.keychainPlacement)) {
    errors.push(`keychainPlacement must be one of: ${VALID_PLACEMENTS.join(', ')}`)
  }

  if (params.isKeychain) {
    if (params.holeDiameter < 2 || params.holeDiameter > 15) {
      errors.push('Hole diameter must be between 2 and 15 mm')
    }

    if (params.keychainPlacement === 'inside') {
      // The hole must fit on the relevant axis with at least INSIDE_MIN_INTERIOR left over.
      const isVertical =
        params.keychainPosition === 'top' || params.keychainPosition === 'bottom'
      const axisDim = isVertical ? params.height : params.width
      if (params.holeDiameter + INSIDE_MIN_INTERIOR > axisDim) {
        errors.push(
          `Shape is too small for an inside hole on the ${params.keychainPosition} edge — ` +
            `increase ${isVertical ? 'height' : 'width'} or switch to outside placement`,
        )
      }
    }
  }

  return { valid: errors.length === 0, errors }
}
