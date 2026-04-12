import './styles/main.css'
import { createScene, updateSceneMesh, setMeshColor } from './app/viewer/scene'
import { createCamera } from './app/viewer/camera'
import { addLights } from './app/viewer/lights'
import { createRenderer } from './app/viewer/renderer'
import { createControls } from './app/ui/controls'
import { getState, subscribe, updateGeometry } from './app/ui/state'
import { buildModel } from './core/model/buildModel'
import { exportStl } from './app/export/exportStl'

function main(): void {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement

  const scene = createScene()
  const camera = createCamera(canvas.clientWidth, canvas.clientHeight)
  addLights(scene)
  createRenderer(canvas, camera, scene)

  createControls()

  function rebuild(): void {
    const { params, modelColor } = getState()
    try {
      const geometry = buildModel(params)
      updateGeometry(geometry)
      updateSceneMesh(scene, geometry)
      // Re-apply color after mesh swap (new material resets to default)
      setMeshColor(modelColor)
    } catch (err) {
      console.error('[NomiCAD] Model build error:', err)
    }
  }

  // Track the params reference so we can distinguish a geometry-changing
  // update from a color-only update. updateColor() never reassigns params,
  // so state.params stays the same object reference.
  let lastParams = getState().params

  subscribe((state) => {
    if (state.params !== lastParams) {
      lastParams = state.params
      rebuild()
    } else {
      // Only modelColor changed — update material in-place, skip JSCAD rebuild.
      setMeshColor(state.modelColor)
    }
  })

  rebuild()

  document.getElementById('export-stl')?.addEventListener('click', () => {
    const { geometry } = getState()
    if (geometry) exportStl(geometry)
  })
}

main()
