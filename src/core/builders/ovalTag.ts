import { primitives, transforms } from '@jscad/modeling'
import type { OvalParams } from '../parameters/ovalParams'

export function buildOvalTag(params: OvalParams): any {
  const { width, height, thickness } = params
  const radius = Math.max(width, height) / 2
  const cylinder = primitives.cylinder({ radius, height: thickness, segments: 64 })
  return transforms.scale([width / (radius * 2), height / (radius * 2), 1], cylinder)
}
