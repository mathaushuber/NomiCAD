import { DEFAULT_PARAMS } from '../../core/parameters/common'
import type { ModelParams } from '../../core/parameters/common'

export const DEFAULT_MODEL_COLOR = '#4a9eff'

export interface AppState {
  params: ModelParams
  geometry: any | null
  modelColor: string
}

type Listener = (state: AppState) => void

let state: AppState = {
  params: { ...DEFAULT_PARAMS },
  geometry: null,
  modelColor: DEFAULT_MODEL_COLOR,
}

const listeners: Listener[] = []

function notify(): void {
  for (const fn of listeners) fn(state)
}

export function getState(): AppState {
  return state
}

export function updateParams(partial: Partial<ModelParams>): void {
  state = { ...state, params: { ...state.params, ...partial } }
  notify()
}

export function updateGeometry(geometry: any): void {
  state = { ...state, geometry }
}

/** Updates the viewer color without touching geometry params — no rebuild needed. */
export function updateColor(color: string): void {
  state = { ...state, modelColor: color }
  notify()
}

export function subscribe(fn: Listener): () => void {
  listeners.push(fn)
  return () => {
    const i = listeners.indexOf(fn)
    if (i > -1) listeners.splice(i, 1)
  }
}
