import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export interface ViewerContext {
  renderer: THREE.WebGLRenderer
  controls: OrbitControls
  dispose: () => void
}

export function createRenderer(
  canvas: HTMLCanvasElement,
  camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
): ViewerContext {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.minDistance = 20
  controls.maxDistance = 500
  controls.target.set(0, 0, 0)

  let frameId: number

  function animate(): void {
    frameId = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }

  animate()

  function onResize(): void {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h, false)
  }

  window.addEventListener('resize', onResize)

  return {
    renderer,
    controls,
    dispose: () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      renderer.dispose()
    },
  }
}
