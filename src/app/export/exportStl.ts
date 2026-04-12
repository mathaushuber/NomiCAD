import { serialize } from '@jscad/stl-serializer'

/**
 * Serializes JSCAD geometry to a binary STL file and triggers a browser download.
 *
 * Binary STL is preferred over ASCII STL:
 *  - Vertex coordinates are stored as 32-bit IEEE 754 floats, avoiding the
 *    ASCII decimal rounding that causes slicers to report spurious non-manifold
 *    warnings from nearly-identical vertices.
 *  - Smaller file size, faster to parse in Bambu Studio / Cura / PrusaSlicer.
 */
export function exportStl(jscadGeom: any, filename = 'nomicad-export.stl'): void {
  const rawData = serialize({ binary: true }, jscadGeom) as ArrayBuffer[]
  const blob = new Blob(rawData, { type: 'model/stl' })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()

  URL.revokeObjectURL(url)
}
