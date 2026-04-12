import './styles/main.css'
import { createScene, updateSceneMesh } from './app/viewer/scene'
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
    const { params } = getState()
    try {
      const geometry = buildModel(params)
      updateGeometry(geometry)
      updateSceneMesh(scene, geometry)
    } catch (err) {
      console.error('[NomiCAD] Model build error:', err)
    }
  }

  subscribe(rebuild)
  rebuild()

  document.getElementById('export-stl')?.addEventListener('click', () => {
    const { geometry } = getState()
    if (geometry) exportStl(geometry)
  })
}

main()
