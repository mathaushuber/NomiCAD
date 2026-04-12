import { primitives, transforms } from '@jscad/modeling'
import type { Shape, KeychainPosition } from '../parameters/common'

/** mm the tab disk overlaps into the shape for a seamless, gap-free union. */
const OVERLAP = 2.5

/** mm of solid wall kept around the hole on all sides. */
const WALL = 3

/**
 * For a flat-top hexagon the top/bottom edge midpoints are inset from the
 * bounding box by a factor of sin(60°) = √3/2.  All other shape edges sit at
 * their bounding-box boundary (or at a vertex that coincides with it).
 */
const HEXAGON_FLAT_FACTOR = Math.sqrt(3) / 2

export interface KeychainTabParams {
  shape: Shape
  position: KeychainPosition
  holeDiameter: number
  thickness: number
  shapeWidth: number
  shapeHeight: number
}

export interface KeychainTabResult {
  /** Tab disk geometry — union this with the base shape before subtracting the hole. */
  tab: any
  /** X coordinate of the tab centre (= hole centre). */
  holeX: number
  /** Y coordinate of the tab centre (= hole centre). */
  holeY: number
}

/**
 * Returns the actual geometric distance from the shape centre to the edge
 * (or closest boundary point) in the direction of `position`.
 *
 * Using the bounding-box half-dimension directly is incorrect for shapes where
 * the edge geometry does not reach the bounding box:
 *  - Flat-top hexagon: top/bottom edges are at (height/2) × sin(60°) from
 *    centre, not height/2.  Left/right positions hit corner vertices which do
 *    sit at width/2, so bounding-box is correct there.
 *  - All other supported shapes: bounding-box half-dimension is correct.
 */
export function shapeEdgeDistance(
  shape: Shape,
  position: KeychainPosition,
  shapeWidth: number,
  shapeHeight: number,
): number {
  const isVertical = position === 'top' || position === 'bottom'
  if (shape === 'hexagon' && isVertical) {
    return (shapeHeight / 2) * HEXAGON_FLAT_FACTOR
  }
  return isVertical ? shapeHeight / 2 : shapeWidth / 2
}

/**
 * Builds a circular external tab that attaches to the edge of the base shape.
 * The tab overlaps `OVERLAP` mm into the shape so the union is seamless.
 * The caller must:
 *   1. union(shape, result.tab)
 *   2. subtract the keyring hole at (result.holeX, result.holeY)
 */
export function buildKeychainTab(params: KeychainTabParams): KeychainTabResult {
  const { shape, position, holeDiameter, thickness, shapeWidth, shapeHeight } = params

  // Keep the tab proportional — never wider than 40% of the smaller shape dimension.
  const rawRadius = holeDiameter / 2 + WALL
  const tabRadius = Math.min(rawRadius, Math.min(shapeWidth, shapeHeight) * 0.4)

  const [cx, cy] = centerFor(shape, position, shapeWidth, shapeHeight, tabRadius)

  const tab = transforms.translate(
    [cx, cy, 0],
    primitives.cylinder({ radius: tabRadius, height: thickness, segments: 48 }),
  )

  return { tab, holeX: cx, holeY: cy }
}

/** Returns the XY centre of the tab disk for a given edge position. */
function centerFor(
  shape: Shape,
  position: KeychainPosition,
  shapeWidth: number,
  shapeHeight: number,
  tabRadius: number,
): [number, number] {
  const edge = shapeEdgeDistance(shape, position, shapeWidth, shapeHeight)
  // Place the tab so that `OVERLAP` mm of it is inside the shape boundary.
  const protrusion = edge + tabRadius - OVERLAP
  switch (position) {
    case 'top':    return [0,  protrusion]
    case 'bottom': return [0, -protrusion]
    case 'left':   return [-protrusion, 0]
    case 'right':  return [ protrusion, 0]
  }
}
