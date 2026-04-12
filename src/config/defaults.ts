import type { NomiCADConfig } from './types'

export const DEFAULT_CONFIG: Readonly<NomiCADConfig> = {
  language:               'en',
  defaultColor:           '#4a9eff',
  units:                  'mm',
  projectName:            'NomiCAD',
  sidebarBackgroundColor: '#13132b',   // matches --surface in main.css
  sidebarTextColor:       '#e0e0f0',   // matches --text in main.css
}
