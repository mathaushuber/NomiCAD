/**
 * English translations — the canonical source of truth for translation keys.
 * Every other locale must satisfy `typeof en` (enforced in index.ts).
 */
const en = {
  // ── App shell ──────────────────────────────────────────────
  'app.title':    'NomiCAD',
  'app.subtitle': 'Parametric Modeling',

  // ── Shape group ────────────────────────────────────────────
  'shape.group':     'Shape',
  'shape.type':      'Type',
  'shape.rectangle': 'Rectangle',
  'shape.oval':      'Oval',
  'shape.width':     'Width (mm)',
  'shape.height':    'Height (mm)',
  'shape.thickness': 'Thickness (mm)',

  // ── Keychain group ─────────────────────────────────────────
  'keychain.group':             'Keychain',
  'keychain.enable':            'Add keyring hole',
  'keychain.diameter':          'Hole diameter (mm)',
  'keychain.placement':         'Placement',
  'keychain.placement.outside': 'Outside',
  'keychain.placement.inside':  'Inside',
  'keychain.position':          'Position',
  'keychain.position.top':      'Top',
  'keychain.position.bottom':   'Bottom',
  'keychain.position.left':     'Left',
  'keychain.position.right':    'Right',

  // ── Text group ─────────────────────────────────────────────
  'text.group':       'Text',
  'text.content':     'Content',
  'text.placeholder': 'Enter text...',
  'text.mode':        'Mode',
  'text.mode.raised': 'Raised',
  'text.mode.inset':  'Inset',
  'text.mode.cutout': 'Cutout',

  // ── Display group ──────────────────────────────────────────
  'display.group':     'Display',
  'display.color':     'Model color',
  'display.colorInfo':
    'The selected color is only for visualization purposes. STL files store geometry only ' +
    'and do not support color information.',

  // ── Actions ────────────────────────────────────────────────
  'export.stl': 'Export STL',

  // ── Watermark ──────────────────────────────────────────────
  'watermark.credit': 'made by Mathaus Huber',
} as const

export default en

/** Shape of every translation object in this library.
 *  Values are widened to `string` so other locales can assign their own text. */
export type Translations = { readonly [K in keyof typeof en]: string }
