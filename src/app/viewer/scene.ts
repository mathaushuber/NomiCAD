import * as THREE from 'three'
import { geometries } from '@jscad/modeling'

let activeMesh: THREE.Mesh | null = null

export function createScene(): THREE.Scene {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0d0d1a)

  const grid = new THREE.GridHelper(200, 20, 0x1e1e3a, 0x1e1e3a)
  scene.add(grid)

  return scene
}

/**
 * Converts a JSCAD Geom3 into a Three.js BufferGeometry via fan triangulation.
 * JSCAD polygons are convex, so fan triangulation is always valid.
 */
export function jscadToThreeGeometry(jscadGeom: any): THREE.BufferGeometry {
  const polygons: any[] = geometries.geom3.toPolygons(jscadGeom)
  const positions: number[] = []

  for (const poly of polygons) {
    const verts: [number, number, number][] = poly.vertices
    for (let i = 1; i < verts.length - 1; i++) {
      const [v0, v1, v2] = [verts[0], verts[i], verts[i + 1]]
      positions.push(v0[0], v0[1], v0[2])
      positions.push(v1[0], v1[1], v1[2])
      positions.push(v2[0], v2[1], v2[2])
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.computeVertexNormals()
  return geo
}

/**
 * Replaces the current model mesh in the scene, disposing the previous one
 * to avoid memory leaks.
 */
export function updateSceneMesh(scene: THREE.Scene, jscadGeom: any): void {
  if (activeMesh) {
    scene.remove(activeMesh)
    activeMesh.geometry.dispose()
    ;(activeMesh.material as THREE.Material).dispose()
    activeMesh = null
  }

  const geometry = jscadToThreeGeometry(jscadGeom)

  const material = new THREE.MeshPhongMaterial({
    color: 0x4a9eff,
    specular: 0x0a1a2e,
    shininess: 50,
    side: THREE.DoubleSide,
  })

  activeMesh = new THREE.Mesh(geometry, material)
  // JSCAD is Z-up; rotate to Three.js Y-up so the model lies flat on the grid
  activeMesh.rotation.x = -Math.PI / 2
  scene.add(activeMesh)
}
