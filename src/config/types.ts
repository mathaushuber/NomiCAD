/** Languages with full translation coverage in the library. */
export type SupportedLanguage = 'en' | 'pt-BR'

export interface NomiCADConfig {
  /** UI language. Falls back to "en" for unknown values. */
  language: SupportedLanguage
  /**
   * Primary accent color for the UI theme and the initial 3D object color.
   * Must be a 6-digit CSS hex string, e.g. "#2e67a9".
   */
  defaultColor: string
  /** Dimensional unit label shown in the UI. */
  units: string
  /**
   * Display name shown in the sidebar header.
   * Falls back to "NomiCAD" when omitted.
   */
  projectName: string
  /**
   * Background color of the sidebar panel (6-digit CSS hex).
   * Falls back to the global surface color.
   */
  sidebarBackgroundColor: string
  /**
   * Primary text color used inside the sidebar (6-digit CSS hex).
   * Falls back to the global text color.
   */
  sidebarTextColor: string
}
