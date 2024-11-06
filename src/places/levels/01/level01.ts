import {
  ArxMap,
  Color,
  Entity,
  QUADIFY,
  Rotation,
  Settings,
  SHADING_SMOOTH,
  Texture,
  Vector3,
} from 'arx-level-generator'
import { createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { createLight, createZone } from 'arx-level-generator/tools'
import { pickRandom, pickWeightedRandoms, randomBetween } from 'arx-level-generator/utils/random'
import { MathUtils, Vector2 } from 'three'
import { createEntity, EntityTypes } from '@/entities/entity.js'
import { createSun } from '@/entities/sun.js'
import { sfxPlayerAppears4SoundScript } from '@/sounds.js'
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

function createRandomPosition(exclusionsAt: Vector3[]) {
  const position = new Vector3(0, 0, 0)

  do {
    position.x = randomBetween(-1800, 1800)
    position.z = randomBetween(-1800, 1800)
  } while (position.distanceTo(exclusionsAt[0]) <= 150)

  return position
}

export function createLevel01(gameState: Entity, settings: Settings): ArxMap {
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

  const eveningSky = Color.fromCSS('#582402')

  const lightColor = eveningSky.clone().lighten(40)

  for (let x = 0; x < 8; x++) {
    for (let z = 0; z < 8; z++) {
      const maxLightIntensity = 1
      map.lights.push(
        createLight({
          position: new Vector3(-2000 + 250 + x * 500, -500, -2000 + 250 + z * 500),
          radius: 900,
          intensity: ((x + z) / 2) * (maxLightIntensity / 8),
          color: lightColor,
        }),
      )
    }
  }

  // -------------------------

  const spawnZone1 = createZone({
    name: 'level01_spawn1',
    size: new Vector3(100, 100, 100),
    backgroundColor: eveningSky,
    drawDistance: 7000,
  })
  map.zones.push(spawnZone1)

  // TODO: add more spawns
  const spawn1 = Entity.marker
  map.entities.push(spawn1)

  const spawns: Entity[] = [spawn1]
  const spawnPoints = spawns.map(({ position }) => position)

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
        position: createRandomPosition(spawnPoints),
        size: randomBetween(20, 50),
        type: value,
      })
    }),
    ...mediums.map(({ value }) => {
      return createEntity({
        position: createRandomPosition(spawnPoints),
        size: randomBetween(40, 125),
        type: value,
      })
    }),
    ...larges.map(({ value }) => {
      return createEntity({
        position: createRandomPosition(spawnPoints),
        size: randomBetween(100, 250),
        type: value,
      })
    }),
    ...extraLarges.map(({ value }) => {
      return createEntity({
        position: createRandomPosition(spawnPoints),
        size: randomBetween(200, 300),
        type: value,
      })
    }),
  )

  // -------------------------

  const boss = createEntity({
    position: createRandomPosition(spawnPoints),
    size: 300,
    type: EntityTypes.GoblinKing,
  })

  boss.script?.on('consumed', () => {
    return `sendevent victory ${gameState.ref} nop`
  })

  map.entities.push(boss)

  // -------------------------

  gameState.script?.on('goto_level01', () => {
    return `
set §tmp ^rnd_${spawns.length}

${spawns
  .map((spawn, index) => {
    return `
if (§tmp == ${index}) {
  ${sfxPlayerAppears4SoundScript.play()}
  teleport -p ${spawn.ref}
}
`
  })
  .join('\n')}
`
  })

  // -------------------------

  const sunAt = new Vector3(1500, 70, 3000)

  const platformUnderTheSun = createPlaneMesh({
    size: 100,
    texture: Texture.alpha,
  })
  platformUnderTheSun.position.x = sunAt.x
  platformUnderTheSun.position.y = sunAt.y + 1000
  platformUnderTheSun.position.z = sunAt.z
  map.polygons.addThreeJsMesh(platformUnderTheSun)

  const sun = createSun({
    size: 200,
    position: sunAt,
    orientation: new Rotation(0, MathUtils.degToRad(-90), 0),
  })
  map.entities.push(sun)

  // -------------------------

  if (settings.mode === 'production') {
    for (let i = 0; i < 250; i++) {
      const starAt = new Vector3(randomBetween(-4000, 4000), randomBetween(1000, -3500), randomBetween(-2800, -4000))
      const size = randomBetween(1, 2 + -starAt.z / 1000)

      const platformUnderTheStar = createPlaneMesh({
        size: 10,
        texture: Texture.alpha,
      })
      platformUnderTheStar.position.x = starAt.x
      platformUnderTheStar.position.y = starAt.y + 1000
      platformUnderTheStar.position.z = starAt.z
      map.polygons.addThreeJsMesh(platformUnderTheStar, { tryToQuadify: QUADIFY })

      const star = createSun({
        size,
        position: starAt,
      })
      map.entities.push(star)
    }

    for (let i = 0; i < 100; i++) {
      const starAt = new Vector3(randomBetween(-2800, -4000), randomBetween(1000, -3500), randomBetween(-5000, 2000))
      const size = 2 + -(starAt.z - 2000) / 1000

      const platformUnderTheStar = createPlaneMesh({
        size: 10,
        texture: Texture.alpha,
      })
      platformUnderTheStar.position.x = starAt.x
      platformUnderTheStar.position.y = starAt.y + 1000
      platformUnderTheStar.position.z = starAt.z
      map.polygons.addThreeJsMesh(platformUnderTheStar, { tryToQuadify: QUADIFY })

      const star = createSun({
        size,
        position: starAt,
      })
      map.entities.push(star)
    }

    for (let i = 0; i < 100; i++) {
      const starAt = new Vector3(randomBetween(2800, 4000), randomBetween(1000, -3000), randomBetween(-4000, 0))
      const size = 1 + -starAt.z / 1000

      const platformUnderTheStar = createPlaneMesh({
        size: 10,
        texture: Texture.alpha,
      })
      platformUnderTheStar.position.x = starAt.x
      platformUnderTheStar.position.y = starAt.y + 1000
      platformUnderTheStar.position.z = starAt.z
      map.polygons.addThreeJsMesh(platformUnderTheStar, { tryToQuadify: QUADIFY })

      const star = createSun({
        size,
        position: starAt,
      })
      map.entities.push(star)
    }
  }

  // -------------------------

  return map
}
