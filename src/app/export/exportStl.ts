import { serialize } from '@jscad/stl-serializer'

export function exportStl(jscadGeom: any, filename = 'nomicad-export.stl'): void {
  const [stlData] = serialize({ binary: false }, jscadGeom) as string[]

  const blob = new Blob([stlData], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()

  URL.revokeObjectURL(url)
}
