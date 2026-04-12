import type { Translations } from './en'

const ptBR: Translations = {
  // ── App shell ──────────────────────────────────────────────
  'app.title':    'NomiCAD',
  'app.subtitle': 'Modelagem Paramétrica',

  // ── Shape group ────────────────────────────────────────────
  'shape.group':     'Forma',
  'shape.type':      'Tipo',
  'shape.rectangle': 'Retângulo',
  'shape.oval':      'Oval',
  'shape.width':     'Largura (mm)',
  'shape.height':    'Altura (mm)',
  'shape.thickness': 'Espessura (mm)',

  // ── Keychain group ─────────────────────────────────────────
  'keychain.group':             'Chaveiro',
  'keychain.enable':            'Adicionar furo para argola',
  'keychain.diameter':          'Diâmetro do furo (mm)',
  'keychain.placement':         'Posicionamento',
  'keychain.placement.outside': 'Externo',
  'keychain.placement.inside':  'Interno',
  'keychain.position':          'Posição',
  'keychain.position.top':      'Cima',
  'keychain.position.bottom':   'Baixo',
  'keychain.position.left':     'Esquerda',
  'keychain.position.right':    'Direita',

  // ── Text group ─────────────────────────────────────────────
  'text.group':       'Texto',
  'text.content':     'Conteúdo',
  'text.placeholder': 'Digite o texto...',
  'text.mode':        'Modo',
  'text.mode.raised': 'Relevo',
  'text.mode.inset':  'Rebaixado',
  'text.mode.cutout': 'Recorte',

  // ── Display group ──────────────────────────────────────────
  'display.group':     'Exibição',
  'display.color':     'Cor do modelo',
  'display.colorInfo':
    'A cor selecionada é apenas para fins de visualização. Arquivos STL armazenam somente ' +
    'geometria e não suportam informações de cor.',

  // ── Actions ────────────────────────────────────────────────
  'export.stl': 'Exportar STL',

  // ── Watermark ──────────────────────────────────────────────
  'watermark.credit': 'feito por Mathaus Huber',
}

export default ptBR
