import { DEFAULT_PARAMS } from '../../src/core/parameters/common'
import type { ModelParams } from '../../src/core/parameters/common'

/**
 * Creates a ModelParams object by merging DEFAULT_PARAMS with the provided
 * overrides. Use this in every test that needs a params object — it ensures
 * tests only declare the fields that are relevant to the behaviour under test
 * and remain valid as the default shape evolves.
 */
export function makeParams(overrides: Partial<ModelParams> = {}): ModelParams {
  return { ...DEFAULT_PARAMS, ...overrides }
}
