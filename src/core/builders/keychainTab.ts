import { primitives, transforms } from '@jscad/modeling'
import type { KeychainPosition } from '../parameters/common'

/** mm the tab disk overlaps into the shape for a seamless, gap-free union. */
const OVERLAP = 2.5

/** mm of solid wall kept around the hole on all sides. */
const WALL = 3

export interface KeychainTabParams {
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
 * Builds a circular external tab that attaches to the edge of the base shape.
 * The tab overlaps `OVERLAP` mm into the shape so the union is seamless.
 * The caller must:
 *   1. union(shape, result.tab)
 *   2. subtract the keyring hole at (result.holeX, result.holeY)
 */
export function buildKeychainTab(params: KeychainTabParams): KeychainTabResult {
  const { position, holeDiameter, thickness, shapeWidth, shapeHeight } = params

  // Keep the tab proportional — never wider than 40% of the smaller shape dimension.
  const rawRadius = holeDiameter / 2 + WALL
  const tabRadius = Math.min(rawRadius, Math.min(shapeWidth, shapeHeight) * 0.4)

  const [cx, cy] = centerFor(position, shapeWidth, shapeHeight, tabRadius)

  const tab = transforms.translate(
    [cx, cy, 0],
    primitives.cylinder({ radius: tabRadius, height: thickness, segments: 48 }),
  )

  return { tab, holeX: cx, holeY: cy }
}

/** Returns the XY centre of the tab disk for a given edge position. */
function centerFor(
  position: KeychainPosition,
  shapeWidth: number,
  shapeHeight: number,
  tabRadius: number,
): [number, number] {
  // Place the tab so that `OVERLAP` mm of it is inside the shape boundary.
  // Tab centre = shape-edge distance + tab radius - overlap
  switch (position) {
    case 'top':
      return [0, shapeHeight / 2 + tabRadius - OVERLAP]
    case 'bottom':
      return [0, -(shapeHeight / 2 + tabRadius - OVERLAP)]
    case 'left':
      return [-(shapeWidth / 2 + tabRadius - OVERLAP), 0]
    case 'right':
      return [shapeWidth / 2 + tabRadius - OVERLAP, 0]
  }
}
