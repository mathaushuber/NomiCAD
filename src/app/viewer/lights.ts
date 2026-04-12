import * as THREE from 'three'

export function addLights(scene: THREE.Scene): void {
  const ambient = new THREE.AmbientLight(0xffffff, 0.45)
  scene.add(ambient)

  const key = new THREE.DirectionalLight(0xffffff, 1.4)
  key.position.set(60, 80, 100)
  scene.add(key)

  const fill = new THREE.DirectionalLight(0x8899cc, 0.5)
  fill.position.set(-60, -40, 60)
  scene.add(fill)

  const rim = new THREE.DirectionalLight(0xffffff, 0.2)
  rim.position.set(0, -100, -60)
  scene.add(rim)
}
