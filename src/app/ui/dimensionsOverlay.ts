import { measurements } from '@jscad/modeling'

// ── DOM creation ──────────────────────────────────────────────────────────────

function makeRow(axis: string): { row: HTMLElement; value: HTMLElement } {
  const row = document.createElement('div')
  row.className = 'dim-row'

  const axisLabel = document.createElement('span')
  axisLabel.className = 'dim-axis'
  axisLabel.textContent = axis

  const value = document.createElement('span')
  value.className = 'dim-value'
  value.textContent = '—'

  row.appendChild(axisLabel)
  row.appendChild(value)
  return { row, value }
}

interface DimensionsOverlay {
  /** The DOM element to mount inside #viewport. */
  element: HTMLElement
  /** Recomputes dimensions from the latest JSCAD geometry and updates the display. */
  update: (geometry: any) => void
}

export function createDimensionsOverlay(): DimensionsOverlay {
  const panel = document.createElement('div')
  panel.id = 'dim-overlay'
  panel.setAttribute('aria-label', 'Model dimensions')

  const { row: rowX, value: valX } = makeRow('X')
  const { row: rowY, value: valY } = makeRow('Y')
  const { row: rowZ, value: valZ } = makeRow('Z')

  panel.appendChild(rowX)
  panel.appendChild(rowY)
  panel.appendChild(rowZ)

  function fmt(n: number): string {
    // Show one decimal place; suppress trailing zero (e.g. 3.0 not 3.00)
    return n.toFixed(1) + ' mm'
  }

  function update(geometry: any): void {
    if (!geometry) return
    try {
      const [[minX, minY, minZ], [maxX, maxY, maxZ]] =
        measurements.measureBoundingBox(geometry) as [[number, number, number], [number, number, number]]

      valX.textContent = fmt(maxX - minX)
      valY.textContent = fmt(maxY - minY)
      valZ.textContent = fmt(maxZ - minZ)
    } catch {
      valX.textContent = '—'
      valY.textContent = '—'
      valZ.textContent = '—'
    }
  }

  return { element: panel, update }
}
