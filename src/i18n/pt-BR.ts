import type { Translations } from './en'

const ptBR: Translations = {
  // ── App shell ──────────────────────────────────────────────
  'app.title':    'NomiCAD',
  'app.subtitle': 'Modelagem Paramétrica',

  // ── Shape group ────────────────────────────────────────────
  'shape.group':     'Forma',
  'shape.type':      'Tipo',
  // Shape names
  'shape.rectangle':         'Retângulo',
  'shape.rounded-rectangle': 'Retângulo Arredondado',
  'shape.oval':              'Oval',
  'shape.circle':            'Círculo',
  'shape.triangle':          'Triângulo',
  'shape.hexagon':           'Hexágono',
  'shape.star':              'Estrela',
  'shape.heart':             'Coração',
  // Shape categories
  'shape.category.basic':      'Básico',
  'shape.category.geometric':  'Geométrico',
  'shape.category.decorative': 'Decorativo',
  // Dimension labels
  'shape.width':     'Largura (mm)',
  'shape.height':    'Altura (mm)',
  'shape.diameter':  'Diâmetro (mm)',
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
  'text.group':        'Texto',
  'text.content':      'Conteúdo',
  'text.placeholder':  'Digite o texto...',
  'text.font':         'Fonte',
  // Rótulos dos grupos de fonte
  'text.font.group.classic':      'Clássico',
  'text.font.group.proportions':  'Proporções',
  'text.font.group.style':        'Estilo',
  // Grupo Clássico
  'text.font.simplex':       'Simplex',
  'text.font.simplex-bold':  'Negrito',
  'text.font.simplex-light': 'Leve',
  'text.font.heavy':         'Pesado',
  'text.font.poster':        'Pôster',
  // Grupo Proporções
  'text.font.condensed':      'Condensado',
  'text.font.extended':       'Estendido',
  'text.font.bold-condensed': 'Negrito Condensado',
  'text.font.bold-extended':  'Negrito Estendido',
  'text.font.wide':           'Largo',
  // Grupo Estilo
  'text.font.simplex-angular': 'Angular',
  'text.font.stencil':         'Stencil',
  'text.font.technical':       'Técnico',
  'text.font.engraved':        'Gravado',
  'text.font.rounded':         'Arredondado',
  'text.size':         'Tamanho do Texto',
  'text.mode':         'Modo',
  'text.mode.raised':  'Relevo',
  'text.mode.inset':   'Rebaixado',
  'text.mode.cutout':  'Recorte',
  'text.offsetX':      'Deslocamento Horizontal (mm)',
  'text.offsetY':      'Deslocamento Vertical (mm)',
  'text.reliefDepth':  'Altura do Relevo (mm)',
  'text.insetDepth':   'Profundidade do Rebaixo (mm)',

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
