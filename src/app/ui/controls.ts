import { getState, updateParams, updateColor } from './state'
import type { Shape, TextMode, KeychainPosition, KeychainPlacement, ModelParams } from '../../core/parameters/common'
import { getKeychainConstraint } from '../../core/parameters/shapeConstraints'
import { t } from '../../i18n/index'

// ── DOM helpers ────────────────────────────────────────────────────────────

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

// ── Control primitives ─────────────────────────────────────────────────────

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
    'data-key': key as string,
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

function textRow(
  label: string,
  key: keyof ReturnType<typeof getState>['params'],
): HTMLElement {
  const params = getState().params
  const row = el('div')
  row.className = 'control-row'

  const lbl = el('label')
  lbl.textContent = label

  const input = el<HTMLInputElement>('input', {
    type: 'text',
    value: String(params[key]),
    maxlength: '24',
    placeholder: t('text.placeholder'),
  })

  input.addEventListener('input', () => {
    updateParams({ [key]: input.value } as Partial<typeof params>)
  })

  row.appendChild(lbl)
  row.appendChild(input)
  return row
}

function checkboxRow(
  label: string,
  key: keyof ReturnType<typeof getState>['params'],
): HTMLElement {
  const params = getState().params
  const row = el('div')
  row.className = 'control-row row-inline'

  const lbl = el('label')
  lbl.textContent = label

  const input = el<HTMLInputElement>('input', { type: 'checkbox', 'data-key': key as string })
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

/** A grouped <select> control for choosing from categorised options. */
function selectRow<T extends string>(
  label: string,
  groups: { group: string; items: { value: T; label: string }[] }[],
  current: T,
  onChange: (v: T) => void,
): HTMLElement {
  const row = el('div')
  row.className = 'control-row'

  const lbl = el('label')
  lbl.textContent = label
  row.appendChild(lbl)

  const select = el<HTMLSelectElement>('select')

  for (const grp of groups) {
    const optgroup = el<HTMLOptGroupElement>('optgroup', { label: grp.group })
    for (const item of grp.items) {
      const opt = el<HTMLOptionElement>('option', { value: item.value })
      opt.textContent = item.label
      if (item.value === current) opt.selected = true
      optgroup.appendChild(opt)
    }
    select.appendChild(optgroup)
  }

  select.addEventListener('change', () => onChange(select.value as T))

  row.appendChild(select)
  return row
}

function colorPickerRow(): HTMLElement {
  const { modelColor } = getState()

  const row = el('div')
  row.className = 'control-row row-inline'

  const lbl = el('label')
  lbl.textContent = t('display.color')

  const input = el<HTMLInputElement>('input', { type: 'color', value: modelColor })
  input.addEventListener('input', () => updateColor(input.value))

  row.appendChild(lbl)
  row.appendChild(input)
  return row
}

function colorInfoBox(): HTMLElement {
  const box = el('div')
  box.className = 'info-box'
  box.textContent = t('display.colorInfo')
  return box
}

// ── Public entry point ─────────────────────────────────────────────────────

export function createControls(): void {
  const container = document.getElementById('controls')
  if (!container) return

  const { params } = getState()

  // ── Shape ──────────────────────────────────────────────────
  const widthRow     = sliderRow(t('shape.width'),     'width',     20,  120, 1  )
  const heightRow    = sliderRow(t('shape.height'),    'height',    15,  80,  1  )
  const thicknessRow = sliderRow(t('shape.thickness'), 'thickness',  1,  10,  0.5)

  // The width label text node is the first child of the <label> element.
  // We swap it when the shape changes to/from circle (diameter vs width).
  const widthLabelEl = widthRow.querySelector('label')

  // Built below — need forward references so applyShapeUX can reach them.
  let placementSegRow: HTMLElement
  let positionSegRow: HTMLElement

  function applyShapeUX(shape: Shape): void {
    // Circle: hide height row, relabel width → diameter.
    const isCircle = shape === 'circle'
    heightRow.style.display = isCircle ? 'none' : ''
    if (widthLabelEl?.childNodes[0]) {
      widthLabelEl.childNodes[0].textContent =
        (isCircle ? t('shape.diameter') : t('shape.width')) + ' '
    }

    // Constrained shapes: show only valid placement/position options and sync active states.
    const constraint = getKeychainConstraint(shape)
    const { params } = getState()

    if (placementSegRow) {
      placementSegRow
        .querySelectorAll<HTMLButtonElement>('.segment-control button')
        .forEach((btn) => {
          const val = btn.dataset['value'] as KeychainPlacement
          if (constraint) {
            const isAllowed = constraint.allowedPlacements.includes(val)
            btn.style.display = isAllowed ? '' : 'none'
            btn.classList.toggle('active', isAllowed && val === params.keychainPlacement)
          } else {
            btn.style.display = ''
            btn.classList.toggle('active', val === params.keychainPlacement)
          }
        })
    }

    if (positionSegRow) {
      positionSegRow
        .querySelectorAll<HTMLButtonElement>('.segment-control button')
        .forEach((btn) => {
          const val = btn.dataset['value'] as KeychainPosition
          if (constraint) {
            const isAllowed = constraint.allowedPositions.includes(val)
            btn.style.display = isAllowed ? '' : 'none'
            btn.classList.toggle('active', isAllowed && val === params.keychainPosition)
          } else {
            btn.style.display = ''
            btn.classList.toggle('active', val === params.keychainPosition)
          }
        })
    }

    // Sync all slider and checkbox DOM elements to the current state values.
    // This ensures the UI reflects shape-change parameter resets applied in state.
    container!.querySelectorAll<HTMLInputElement>('input[data-key]').forEach((input) => {
      const key = input.dataset['key'] as keyof ModelParams
      if (!(key in params)) return
      const v = params[key]
      if (input.type === 'range') {
        input.value = String(v)
        const span = input.closest('.control-row')?.querySelector<HTMLSpanElement>('label span')
        if (span) span.textContent = String(v)
      } else if (input.type === 'checkbox') {
        input.checked = v as boolean
      }
    })
  }

  const shapeSelectRow = selectRow<Shape>(
    t('shape.type'),
    [
      {
        group: t('shape.category.basic'),
        items: [
          { value: 'rectangle',         label: t('shape.rectangle')         },
          { value: 'rounded-rectangle', label: t('shape.rounded-rectangle') },
          { value: 'oval',              label: t('shape.oval')              },
          { value: 'circle',            label: t('shape.circle')            },
        ],
      },
      {
        group: t('shape.category.geometric'),
        items: [
          { value: 'triangle', label: t('shape.triangle') },
          { value: 'hexagon',  label: t('shape.hexagon')  },
          { value: 'star',     label: t('shape.star')     },
        ],
      },
      {
        group: t('shape.category.decorative'),
        items: [
          { value: 'heart', label: t('shape.heart') },
        ],
      },
    ],
    params.shape,
    (v) => {
      updateParams({ shape: v })
      applyShapeUX(v)
    },
  )

  container.appendChild(
    group(
      t('shape.group'),
      shapeSelectRow,
      widthRow,
      heightRow,
      thicknessRow,
    ),
  )

  container.appendChild(divider())

  // ── Keychain ───────────────────────────────────────────────
  placementSegRow = segmentRow<KeychainPlacement>(
    t('keychain.placement'),
    [
      { value: 'outside', label: t('keychain.placement.outside') },
      { value: 'inside',  label: t('keychain.placement.inside')  },
    ],
    params.keychainPlacement,
    (v) => updateParams({ keychainPlacement: v }),
  )

  positionSegRow = segmentRow<KeychainPosition>(
    t('keychain.position'),
    [
      { value: 'top',    label: t('keychain.position.top')    },
      { value: 'bottom', label: t('keychain.position.bottom') },
      { value: 'left',   label: t('keychain.position.left')   },
      { value: 'right',  label: t('keychain.position.right')  },
    ],
    params.keychainPosition,
    (v) => updateParams({ keychainPosition: v }),
  )

  container.appendChild(
    group(
      t('keychain.group'),
      checkboxRow(t('keychain.enable'),   'isKeychain'),
      sliderRow(t('keychain.diameter'), 'holeDiameter', 2, 12, 0.5),
      placementSegRow,
      positionSegRow,
    ),
  )

  // Reflect the initial shape in the UI now that all rows exist.
  // This handles circle (height row / label) and shape constraints (placement/position buttons).
  applyShapeUX(params.shape)

  container.appendChild(divider())

  // ── Text ───────────────────────────────────────────────────
  container.appendChild(
    group(
      t('text.group'),
      textRow(t('text.content'), 'text'),
      sliderRow(t('text.size'), 'textSize', 0.1, 2.0, 0.1),
      segmentRow<TextMode>(
        t('text.mode'),
        [
          { value: 'positive', label: t('text.mode.raised') },
          { value: 'negative', label: t('text.mode.inset')  },
          { value: 'cutout',   label: t('text.mode.cutout') },
        ],
        params.textMode,
        (v) => updateParams({ textMode: v }),
      ),
    ),
  )

  container.appendChild(divider())

  // ── Display ────────────────────────────────────────────────
  container.appendChild(
    group(t('display.group'), colorPickerRow(), colorInfoBox()),
  )
}
