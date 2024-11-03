import { ArxMap, Entity, QUADIFY, SHADING_SMOOTH, Vector3 } from 'arx-level-generator'
import { createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { createLight } from 'arx-level-generator/tools'
import { isBetween } from 'arx-level-generator/utils'
import { pickRandom, pickWeightedRandoms, randomBetween } from 'arx-level-generator/utils/random'
import { Vector2 } from 'three'
import { createEntity, EntityTypes } from '@/entities/entity.js'
import {
  soilHumanSoil1,
  soilHumanStandard1,
  soilHumanStandard2,
  soilHumanStandard3,
  stoneHumanCityGround1,
  stoneHumanCityGround2,
  stoneHumanCityGround3,
  stoneHumanCityGround4,
} from '@/textures.js'

function createRandomPosition() {
  const position = new Vector3(0, 0, 0)
  while (isBetween(-150, 150, position.x) && isBetween(-150, 150, position.z)) {
    position.x = randomBetween(-1500, 1500)
    position.z = randomBetween(-1500, 1500)
  }
  return position
}

export function createLevel01(gameState: Entity): ArxMap {
  const map = new ArxMap()

  map.polygons.addThreeJsMesh(
    createPlaneMesh({
      size: 4000,
      tileSize: 50,
    }),
    {
      tryToQuadify: QUADIFY,
      shading: SHADING_SMOOTH,
    },
  )

  const tiles = pickWeightedRandoms(map.polygons.length, [
    { value: soilHumanSoil1, weight: 30 },
    { value: soilHumanStandard1, weight: 10 },
    { value: soilHumanStandard2, weight: 15 },
    { value: soilHumanStandard3, weight: 15 },
    { value: stoneHumanCityGround1, weight: 1 },
    { value: stoneHumanCityGround2, weight: 20 },
    { value: stoneHumanCityGround3, weight: 20 },
    { value: stoneHumanCityGround4, weight: 15 },
  ])

  const uvOffsets = [new Vector2(0, 0), new Vector2(0, 0.5), new Vector2(0.5, 0), new Vector2(0.5, 0.5)]

  map.polygons.forEach((polygon, idx) => {
    const texture = tiles[idx].value
    polygon.texture = texture
    if (texture === soilHumanSoil1) {
      const uvOffset = pickRandom(uvOffsets)
      polygon.vertices.forEach((vertex) => {
        vertex.uv.divideScalar(2).add(uvOffset)
      })
    }
  })

  // -------------------------

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

  // -------------------------

  const npcDistribution = [
    { value: EntityTypes.Ylside, weight: 10 },
    { value: EntityTypes.Carrot, weight: 20 },
    { value: EntityTypes.Leek, weight: 20 },
    { value: EntityTypes.GoblinLord, weight: 30 },
    { value: EntityTypes.Goblin, weight: 60 },
  ]

  const smalls = pickWeightedRandoms(100, npcDistribution)
  const mediums = pickWeightedRandoms(50, npcDistribution)
  const larges = pickWeightedRandoms(30, npcDistribution)
  const extraLarges = pickWeightedRandoms(7, npcDistribution)

  map.entities.push(
    ...smalls.map(({ value }) => {
      return createEntity({
        position: createRandomPosition(),
        size: randomBetween(20, 50),
        type: value,
      })
    }),
    ...mediums.map(({ value }) => {
      return createEntity({
        position: createRandomPosition(),
        size: randomBetween(40, 125),
        type: value,
      })
    }),
    ...larges.map(({ value }) => {
      return createEntity({
        position: createRandomPosition(),
        size: randomBetween(100, 250),
        type: value,
      })
    }),
    ...extraLarges.map(({ value }) => {
      return createEntity({
        position: createRandomPosition(),
        size: randomBetween(200, 300),
        type: value,
      })
    }),
  )

  // -------------------------

  const boss = createEntity({
    position: createRandomPosition(),
    size: 300,
    type: EntityTypes.GoblinKing,
  })

  boss.script?.on('consumed', () => {
    return `sendevent victory ${gameState.ref} nop`
  })

  map.entities.push(boss)

  // -------------------------

  return map
}
