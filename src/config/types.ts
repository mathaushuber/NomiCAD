/** Languages with full translation coverage in the library. */
export type SupportedLanguage = 'en' | 'pt-BR'

export interface NomiCADConfig {
  /** UI language. Falls back to "en" for unknown values. */
  language: SupportedLanguage
  /** Default model color shown in the Three.js viewer (CSS hex, e.g. "#4a9eff"). */
  defaultColor: string
  /** Dimensional unit label shown in the UI. */
  units: string
}
