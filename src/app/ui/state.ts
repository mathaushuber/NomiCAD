import { DEFAULT_PARAMS } from '../../core/parameters/common'
import type { ModelParams } from '../../core/parameters/common'

export interface AppState {
  params: ModelParams
  geometry: any | null
}

type Listener = (state: AppState) => void

let state: AppState = {
  params: { ...DEFAULT_PARAMS },
  geometry: null,
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

export function subscribe(fn: Listener): () => void {
  listeners.push(fn)
  return () => {
    const i = listeners.indexOf(fn)
    if (i > -1) listeners.splice(i, 1)
  }
}
