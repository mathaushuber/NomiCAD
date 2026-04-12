import { primitives } from '@jscad/modeling'

export interface CircleParams {
  /** Diameter of the circle (= width param). */
  diameter: number
  thickness: number
}

export function buildCircleTag({ diameter, thickness }: CircleParams): any {
  return primitives.cylinder({ radius: diameter / 2, height: thickness, segments: 64 })
}
