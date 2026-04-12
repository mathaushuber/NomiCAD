import { getState, updateParams } from './state'
import type { Shape, TextMode } from '../../core/parameters/common'

function el<T extends HTMLElement>(tag: string, attrs: Record<string, string> = {}): T {
  const e = document.createElement(tag) as T
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v)
  return e
}

function group(title: string, ...rows: HTMLElement[]): HTMLElement {
  const wrap = el('div')
  wrap.className = 'control-group'
  const h = el('div')
  h.className = 'control-group-title'
  h.textContent = title
  wrap.appendChild(h)
  rows.forEach((r) => wrap.appendChild(r))
  return wrap
}

function divider(): HTMLElement {
  const d = el('div')
  d.className = 'divider'
  return d
}

function sliderRow(
  label: string,
  key: keyof ReturnType<typeof getState>['params'],
  min: number,
  max: number,
  step: number,
): HTMLElement {
  const params = getState().params
  const value = params[key] as number

  const row = el('div')
  row.className = 'control-row'

  const lbl = el<HTMLLabelElement>('label')
  const valSpan = el('span')
  valSpan.textContent = String(value)
  lbl.textContent = label + ' '
  lbl.appendChild(valSpan)

  const input = el<HTMLInputElement>('input', {
    type: 'range',
    min: String(min),
    max: String(max),
    step: String(step),
    value: String(value),
  })

  input.addEventListener('input', () => {
    const v = parseFloat(input.value)
    valSpan.textContent = String(v)
    updateParams({ [key]: v } as Partial<typeof params>)
  })

  row.appendChild(lbl)
  row.appendChild(input)
  return row
}

function textRow(label: string, key: keyof ReturnType<typeof getState>['params']): HTMLElement {
  const params = getState().params
  const row = el('div')
  row.className = 'control-row'

  const lbl = el('label')
  lbl.textContent = label

  const input = el<HTMLInputElement>('input', {
    type: 'text',
    value: String(params[key]),
    maxlength: '24',
    placeholder: 'Enter text...',
  })

  input.addEventListener('input', () => {
    updateParams({ [key]: input.value } as Partial<typeof params>)
  })

  row.appendChild(lbl)
  row.appendChild(input)
  return row
}

function checkboxRow(label: string, key: keyof ReturnType<typeof getState>['params']): HTMLElement {
  const params = getState().params
  const row = el('div')
  row.className = 'control-row row-inline'

  const lbl = el('label')
  lbl.textContent = label

  const input = el<HTMLInputElement>('input', {
    type: 'checkbox',
  })
  input.checked = params[key] as boolean

  input.addEventListener('change', () => {
    updateParams({ [key]: input.checked } as Partial<typeof params>)
  })

  row.appendChild(lbl)
  row.appendChild(input)
  return row
}

function segmentRow<T extends string>(
  label: string,
  options: { value: T; label: string }[],
  current: T,
  onChange: (v: T) => void,
): HTMLElement {
  const row = el('div')
  row.className = 'control-row'

  const lbl = el('label')
  lbl.textContent = label
  row.appendChild(lbl)

  const seg = el('div')
  seg.className = 'segment-control'

  for (const opt of options) {
    const btn = el('button')
    btn.textContent = opt.label
    btn.dataset['value'] = opt.value
    if (opt.value === current) btn.classList.add('active')

    btn.addEventListener('click', () => {
      seg.querySelectorAll('button').forEach((b) => b.classList.remove('active'))
      btn.classList.add('active')
      onChange(opt.value)
    })

    seg.appendChild(btn)
  }

  row.appendChild(seg)
  return row
}

export function createControls(): void {
  const container = document.getElementById('controls')
  if (!container) return

  const { params } = getState()

  // ── Shape ──────────────────────────────────────────────────
  container.appendChild(
    group(
      'Shape',
      segmentRow<Shape>(
        'Type',
        [
          { value: 'rectangle', label: 'Rectangle' },
          { value: 'oval', label: 'Oval' },
        ],
        params.shape,
        (v) => updateParams({ shape: v }),
      ),
      sliderRow('Width (mm)', 'width', 20, 120, 1),
      sliderRow('Height (mm)', 'height', 15, 80, 1),
      sliderRow('Thickness (mm)', 'thickness', 1, 10, 0.5),
    ),
  )

  container.appendChild(divider())

  // ── Keychain ───────────────────────────────────────────────
  container.appendChild(
    group(
      'Keychain',
      checkboxRow('Add keyring hole', 'isKeychain'),
      sliderRow('Hole diameter (mm)', 'holeDiameter', 2, 12, 0.5),
    ),
  )

  container.appendChild(divider())

  // ── Text ───────────────────────────────────────────────────
  container.appendChild(
    group(
      'Text',
      textRow('Content', 'text'),
      segmentRow<TextMode>(
        'Mode',
        [
          { value: 'positive', label: 'Raised' },
          { value: 'negative', label: 'Inset' },
          { value: 'cutout', label: 'Cutout' },
        ],
        params.textMode,
        (v) => updateParams({ textMode: v }),
      ),
    ),
  )
}
