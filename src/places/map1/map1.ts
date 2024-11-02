import { Vector3 } from 'arx-level-generator'
import { createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { createLight } from 'arx-level-generator/tools'
import { randomBetween } from 'arx-level-generator/utils/random'
import { Place } from '../types.js'

export function createMap1(): Place {
  const place: Place = {
    entities: [],
    lights: [],
    meshes: [],
    zones: [],
  }

  const plane = createPlaneMesh({
    size: 4000,
  })
  place.meshes.push(plane)

  for (let x = 0; x < 8; x++) {
    for (let z = 0; z < 8; z++) {
      place.lights.push(
        createLight({
          position: new Vector3(-2000 + 250 + x * 500, -500, -2000 + 250 + z * 500),
          radius: 1000,
          intensity: randomBetween(0.5, 1),
        }),
      )
    }
  }

  return place
}
