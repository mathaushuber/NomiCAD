import { buildModel } from '../core/model/buildModel'
import { DEFAULT_PARAMS } from '../core/parameters/common'
import type { ModelParams } from '../core/parameters/common'

/**
 * Creates a rectangle tag geometry with the given overrides.
 */
export function rectangle(overrides: Partial<ModelParams> = {}): any {
  return buildModel({ ...DEFAULT_PARAMS, ...overrides, shape: 'rectangle' })
}

/**
 * Creates an oval tag geometry with the given overrides.
 */
export function oval(overrides: Partial<ModelParams> = {}): any {
  return buildModel({ ...DEFAULT_PARAMS, ...overrides, shape: 'oval' })
}
