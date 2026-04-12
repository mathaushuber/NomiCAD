import './styles/main.css'
import { config } from './config/loadConfig'
import { setLanguage, t } from './i18n/index'
import { createScene, updateSceneMesh, setMeshColor } from './app/viewer/scene'
import { createCamera } from './app/viewer/camera'
import { addLights } from './app/viewer/lights'
import { createRenderer } from './app/viewer/renderer'
import { createControls } from './app/ui/controls'
import { getState, subscribe, updateGeometry } from './app/ui/state'
import { buildModel } from './core/model/buildModel'
import { exportStl } from './app/export/exportStl'

// ── i18n bootstrap (must happen before any UI is built) ────────────────────
setLanguage(config.language)

function main(): void {
  // ── Apply translations to static HTML elements ──────────────────────────
  const logoEl    = document.querySelector('.logo')
  const subtitleEl = document.querySelector('.subtitle')
  const exportBtn  = document.getElementById('export-stl')

  if (logoEl)     logoEl.textContent     = t('app.title')
  if (subtitleEl) subtitleEl.textContent = t('app.subtitle')
  if (exportBtn)  exportBtn.textContent  = t('export.stl')

  // ── Viewer setup ────────────────────────────────────────────────────────
  const canvas = document.getElementById('canvas') as HTMLCanvasElement

  const scene = createScene()
  const camera = createCamera(canvas.clientWidth, canvas.clientHeight)
  addLights(scene)
  createRenderer(canvas, camera, scene)

  // ── UI ──────────────────────────────────────────────────────────────────
  createControls()

  // ── Model rebuild ───────────────────────────────────────────────────────
  function rebuild(): void {
    const { params, modelColor } = getState()
    try {
      const geometry = buildModel(params)
      updateGeometry(geometry)
      updateSceneMesh(scene, geometry)
      // Re-apply color after mesh swap (new material resets to default).
      setMeshColor(modelColor)
    } catch (err) {
      console.error('[NomiCAD] Model build error:', err)
    }
  }

  // Track the params reference to distinguish a geometry-changing update from
  // a color-only update. updateColor() never reassigns params, so the object
  // reference stays the same and we skip the expensive JSCAD rebuild.
  let lastParams = getState().params

  subscribe((state) => {
    if (state.params !== lastParams) {
      lastParams = state.params
      rebuild()
    } else {
      setMeshColor(state.modelColor)
    }
  })

  rebuild()

  exportBtn?.addEventListener('click', () => {
    const { geometry } = getState()
    if (geometry) exportStl(geometry)
  })
}

main()
