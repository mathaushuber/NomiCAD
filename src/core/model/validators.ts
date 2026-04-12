import type { ModelParams } from '../parameters/common'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateParams(params: ModelParams): ValidationResult {
  const errors: string[] = []

  if (params.width < 10 || params.width > 200) {
    errors.push('Width must be between 10 and 200 mm')
  }

  if (params.height < 10 || params.height > 200) {
    errors.push('Height must be between 10 and 200 mm')
  }

  if (params.thickness < 1 || params.thickness > 20) {
    errors.push('Thickness must be between 1 and 20 mm')
  }

  if (params.isKeychain) {
    if (params.holeDiameter < 2 || params.holeDiameter > 15) {
      errors.push('Hole diameter must be between 2 and 15 mm')
    }

    const minDimension = Math.min(params.width, params.height)
    if (params.holeDiameter >= minDimension * 0.6) {
      errors.push('Hole diameter is too large relative to shape size')
    }
  }

  return { valid: errors.length === 0, errors }
}
