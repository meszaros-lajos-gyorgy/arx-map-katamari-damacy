import { Vector3 } from 'arx-level-generator'
import { randomBetween } from 'arx-level-generator/utils/random'
import { Vector2 } from 'three'
import { EntityTypes } from '@/entities/entity.js'
import { EntitySpawnProps } from '@/entities/entitySpawner.js'

export function createVeggieGardenSpawns(): EntitySpawnProps[] {
  const entitySpawns: EntitySpawnProps[] = []

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 6; j++) {
      entitySpawns.push({
        position: new Vector3(1200 + i * 80 + randomBetween(-20, 20), 0, 1000 + j * 100 + randomBetween(-10, 10)),
        entities: [EntityTypes.Carrot, EntityTypes.Leek],
        size: new Vector2(30, 50),
      })
    }
  }

  return entitySpawns
}

export function createVeggieGardenMesh() {
  // TODO: create garden soil similar to what we have in the outpost
  // TODO: add snake woman light
  // TODO: add some light fence around the garden
}
