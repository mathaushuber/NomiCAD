import { getState, updateParams, updateColor } from './state'
import type { Shape, TextMode, KeychainPosition, KeychainPlacement, ModelParams, FontId } from '../../core/parameters/common'
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

  const widthLabelEl = widthRow.querySelector('label')

  // Forward references for applyShapeUX / applyTextModeUX.
  let placementSegRow: HTMLElement
  let positionSegRow: HTMLElement
  let reliefDepthRow: HTMLElement
  let insetDepthRow: HTMLElement

  // ── applyShapeUX ────────────────────────────────────────────
  function applyShapeUX(shape: Shape): void {
    const isCircle = shape === 'circle'
    heightRow.style.display = isCircle ? 'none' : ''
    if (widthLabelEl?.childNodes[0]) {
      widthLabelEl.childNodes[0].textContent =
        (isCircle ? t('shape.diameter') : t('shape.width')) + ' '
    }

    // With no shape-specific constraints all positions/placements are always
    // shown.  getKeychainConstraint now always returns null, but the logic is
    // kept for future extensibility.
    const constraint = getKeychainConstraint(shape)
    const { params: p } = getState()

    if (placementSegRow) {
      placementSegRow
        .querySelectorAll<HTMLButtonElement>('.segment-control button')
        .forEach((btn) => {
          const val = btn.dataset['value'] as KeychainPlacement
          if (constraint) {
            const isAllowed = constraint.allowedPlacements.includes(val)
            btn.style.display = isAllowed ? '' : 'none'
            btn.classList.toggle('active', isAllowed && val === p.keychainPlacement)
          } else {
            btn.style.display = ''
            btn.classList.toggle('active', val === p.keychainPlacement)
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
            btn.classList.toggle('active', isAllowed && val === p.keychainPosition)
          } else {
            btn.style.display = ''
            btn.classList.toggle('active', val === p.keychainPosition)
          }
        })
    }

    // Sync all slider / checkbox DOM elements to current state (handles
    // shape-change resets applied in state.ts).
    container!.querySelectorAll<HTMLInputElement>('input[data-key]').forEach((input) => {
      const key = input.dataset['key'] as keyof ModelParams
      if (!(key in p)) return
      const v = p[key]
      if (input.type === 'range') {
        input.value = String(v)
        const span = input.closest('.control-row')?.querySelector<HTMLSpanElement>('label span')
        if (span) span.textContent = String(v)
      } else if (input.type === 'checkbox') {
        input.checked = v as boolean
      }
    })
  }

  // ── applyTextModeUX ─────────────────────────────────────────
  /** Shows / hides depth controls based on the active text mode. */
  function applyTextModeUX(mode: TextMode): void {
    if (reliefDepthRow) reliefDepthRow.style.display = mode === 'positive' ? '' : 'none'
    if (insetDepthRow)  insetDepthRow.style.display  = mode === 'negative' ? '' : 'none'
  }

  // ── Shape group ─────────────────────────────────────────────
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

  // ── Keychain group ──────────────────────────────────────────
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
  applyShapeUX(params.shape)

  container.appendChild(divider())

  // ── Text group ──────────────────────────────────────────────
  // Depth controls are mode-specific and start hidden; applyTextModeUX sets
  // the correct initial visibility.
  reliefDepthRow = sliderRow(t('text.reliefDepth'), 'textReliefDepth', 0.2, 5.0, 0.1)
  insetDepthRow  = sliderRow(t('text.insetDepth'),  'textInsetDepth',  0.2, 5.0, 0.1)

  const fontSelectRow = selectRow<FontId>(
    t('text.font'),
    [
      {
        group: t('text.font.group.classic'),
        items: [
          { value: 'simplex',       label: t('text.font.simplex')       },
          { value: 'simplex-bold',  label: t('text.font.simplex-bold')  },
          { value: 'simplex-light', label: t('text.font.simplex-light') },
          { value: 'heavy',         label: t('text.font.heavy')         },
          { value: 'poster',        label: t('text.font.poster')        },
        ],
      },
      {
        group: t('text.font.group.proportions'),
        items: [
          { value: 'condensed',      label: t('text.font.condensed')      },
          { value: 'extended',       label: t('text.font.extended')       },
          { value: 'bold-condensed', label: t('text.font.bold-condensed') },
          { value: 'bold-extended',  label: t('text.font.bold-extended')  },
          { value: 'wide',           label: t('text.font.wide')           },
        ],
      },
      {
        group: t('text.font.group.style'),
        items: [
          { value: 'simplex-angular', label: t('text.font.simplex-angular') },
          { value: 'stencil',         label: t('text.font.stencil')         },
          { value: 'technical',       label: t('text.font.technical')       },
          { value: 'engraved',        label: t('text.font.engraved')        },
          { value: 'rounded',         label: t('text.font.rounded')         },
        ],
      },
    ],
    params.fontFamily,
    (v) => updateParams({ fontFamily: v }),
  )

  container.appendChild(
    group(
      t('text.group'),
      textRow(t('text.content'), 'text'),
      fontSelectRow,
      sliderRow(t('text.size'), 'textSize', 0.1, 2.0, 0.1),
      segmentRow<TextMode>(
        t('text.mode'),
        [
          { value: 'positive', label: t('text.mode.raised') },
          { value: 'negative', label: t('text.mode.inset')  },
          { value: 'cutout',   label: t('text.mode.cutout') },
        ],
        params.textMode,
        (v) => {
          updateParams({ textMode: v })
          applyTextModeUX(v)
        },
      ),
      reliefDepthRow,
      insetDepthRow,
      sliderRow(t('text.offsetX'), 'textOffsetX', -50, 50, 1),
      sliderRow(t('text.offsetY'), 'textOffsetY', -50, 50, 1),
    ),
  )

  // Set initial depth-control visibility based on the loaded text mode.
  applyTextModeUX(params.textMode)

  container.appendChild(divider())

  // ── Display group ───────────────────────────────────────────
  container.appendChild(
    group(t('display.group'), colorPickerRow(), colorInfoBox()),
  )
}
