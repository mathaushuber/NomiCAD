import * as THREE from 'three'

export function createCamera(width: number, height: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000)
  camera.position.set(60, 60, 80)
  camera.lookAt(0, 0, 0)
  return camera
}
