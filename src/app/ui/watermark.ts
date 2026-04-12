import { t } from '../../i18n/index'

/**
 * Creates the permanent sidebar footer element.
 *
 * The watermark always references "NomiCAD" as the library brand regardless
 * of any `projectName` customization, so consumers cannot accidentally remove
 * attribution by changing the project name.
 *
 * The version is injected at build time by Vite (`__APP_VERSION__`).
 * The credit phrase is localized via the active i18n locale.
 */
export function createWatermark(): HTMLElement {
  const footer = document.createElement('footer')
  footer.className = 'sidebar-footer'

  const mark = document.createElement('span')
  mark.className = 'watermark'
  mark.textContent = `NomiCAD v${__APP_VERSION__} — ${t('watermark.credit')}`

  footer.appendChild(mark)
  return footer
}
