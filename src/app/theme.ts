import type { NomiCADConfig } from '../config/types'

// ── Color math helpers ─────────────────────────────────────────────────────

/**
 * Parses a 6-digit hex color into its R, G, B components.
 * Assumes the input has already been validated (e.g. by the CLI).
 */
function parseHex(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

/** Mixes an RGB channel toward white by `factor` (0–1). */
function lightenChannel(c: number, factor: number): number {
  return Math.min(255, Math.round(c + (255 - c) * factor))
}

/** Returns a hex string that is `factor * 100`% lighter than `hex`. */
function lightenHex(hex: string, factor: number): string {
  const [r, g, b] = parseHex(hex)
  return '#' + [lightenChannel(r, factor), lightenChannel(g, factor), lightenChannel(b, factor)]
    .map((c) => c.toString(16).padStart(2, '0'))
    .join('')
}

/** Returns an `rgba()` string for `hex` at the given `alpha`. */
function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Applies the project configuration as CSS custom properties on the
 * document root so that every CSS rule using `var(--accent*)` or
 * `var(--sidebar-*)` reflects configured values without any hardcoded
 * colors in the stylesheet.
 *
 * Must be called once at app bootstrap, before the DOM is rendered.
 */
export function applyTheme(config: NomiCADConfig): void {
  const root = document.documentElement

  // Accent — drives buttons, inputs, the Export STL button, and the 3D object.
  root.style.setProperty('--accent',        config.defaultColor)
  root.style.setProperty('--accent-hover',  lightenHex(config.defaultColor, 0.18))
  root.style.setProperty('--accent-subtle', hexToRgba(config.defaultColor, 0.07))
  root.style.setProperty('--accent-border', hexToRgba(config.defaultColor, 0.18))

  // Sidebar — background and primary text color.
  root.style.setProperty('--sidebar-bg',   config.sidebarBackgroundColor)
  root.style.setProperty('--sidebar-text', config.sidebarTextColor)
}
