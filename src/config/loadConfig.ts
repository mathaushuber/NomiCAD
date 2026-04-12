import type { NomiCADConfig } from './types'
import { DEFAULT_CONFIG } from './defaults'

/**
 * Vite resolves this glob at build time.
 * Returns an empty record when `nomicad.config.json` does not exist in the
 * project root — the consuming project is not required to have one.
 */
const configModules = import.meta.glob('/nomicad.config.json', {
  eager: true,
  import: 'default',
})

function resolve(): NomiCADConfig {
  const raw = configModules['/nomicad.config.json'] as Partial<NomiCADConfig> | undefined
  if (!raw) return { ...DEFAULT_CONFIG }
  // User values override defaults; unknown keys are silently dropped.
  return { ...DEFAULT_CONFIG, ...raw }
}

/**
 * Resolved project configuration.
 * Synchronous — safe to import at module initialisation time.
 */
export const config: NomiCADConfig = resolve()
