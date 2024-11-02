import { ArxMap, QUADIFY, SHADING_SMOOTH, Vector3 } from 'arx-level-generator'
import { createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { createLight } from 'arx-level-generator/tools'
import { randomBetween } from 'arx-level-generator/utils/random'

export function createMap1(): ArxMap {
  const map = new ArxMap()

  map.polygons.addThreeJsMesh(
    createPlaneMesh({
      size: 4000,
    }),
    {
      tryToQuadify: QUADIFY,
      shading: SHADING_SMOOTH,
    },
  )

  for (let x = 0; x < 8; x++) {
    for (let z = 0; z < 8; z++) {
      map.lights.push(
        createLight({
          position: new Vector3(-2000 + 250 + x * 500, -500, -2000 + 250 + z * 500),
          radius: 1000,
          intensity: randomBetween(0.5, 1),
        }),
      )
    }
  }

  return map
}
