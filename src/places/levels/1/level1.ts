import {
  Ambience,
  ArxMap,
  Entity,
  QUADIFY,
  Rotation,
  type Settings,
  SHADING_SMOOTH,
  Texture,
  Vector3,
} from 'arx-level-generator'
import { createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { ScriptSubroutine } from 'arx-level-generator/scripting'
import { useDelay } from 'arx-level-generator/scripting/hooks'
import { PlayerControls } from 'arx-level-generator/scripting/properties'
import { createLight, createZone } from 'arx-level-generator/tools'
import { pickRandom, pickWeightedRandoms } from 'arx-level-generator/utils/random'
import { MathUtils, Vector2 } from 'three'
import { eveningSky } from '@/colors.js'
import { EntityTypes } from '@/entities/entity.js'
import { createEntitySpawner, EntitySpawnProps } from '@/entities/entitySpawner.js'
import { createRootStar, createStar } from '@/entities/star.js'
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
import { NonEmptyArray } from '@/types.js'
import { createVeggieGardenSpawns } from './veggieGarden.js'

export async function createLevel1(gameState: Entity, settings: Settings): Promise<ArxMap> {
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

  const playerSpawnLocations: NonEmptyArray<Vector3> = [
    new Vector3(0, 0, 0),
    new Vector3(-1200, 0, 400),
    new Vector3(1000, 0, 600),
  ]
  const playerSpawnPoints: Entity[] = []

  playerSpawnLocations.forEach((spawnPlayerAt, index) => {
    const playerSpawnZone = createZone({
      position: spawnPlayerAt,
      name: `level1_spawn${index + 1}`,
      size: new Vector3(100, 100, 100),
      backgroundColor: eveningSky,
      ambience: settings.mode === 'production' ? Ambience.rebelsCool : Ambience.none,
      drawDistance: 7000,
    })
    map.zones.push(playerSpawnZone)

    const playerSpawnPoint = Entity.marker.at({ position: spawnPlayerAt })
    map.entities.push(playerSpawnPoint)

    playerSpawnPoints.push(playerSpawnPoint)
  })

  // -------------------------

  const entitySpawns: EntitySpawnProps[] = [
    ...createVeggieGardenSpawns(),

    { entities: [EntityTypes.Ylside], position: new Vector3(0, 0, 200), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(0, 0, 300), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(0, 0, 400), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(0, 0, 500), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(0, 0, 600), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(0, 0, 700), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(0, 0, 800), size: new Vector2(70, 100) },

    { entities: [EntityTypes.Ylside], position: new Vector3(-250, 0, 200), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(-250, 0, 300), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(-250, 0, 400), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(-250, 0, 500), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(-250, 0, 600), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(-250, 0, 700), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(-250, 0, 800), size: new Vector2(70, 100) },

    { entities: [EntityTypes.Ylside], position: new Vector3(-500, 0, 200), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(-500, 0, 300), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(-500, 0, 400), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(-500, 0, 500), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(-500, 0, 600), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(-500, 0, 700), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(-500, 0, 800), size: new Vector2(70, 100) },

    { entities: [EntityTypes.Ylside], position: new Vector3(-750, 0, 200), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(-750, 0, 300), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(-750, 0, 400), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(-750, 0, 500), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(-750, 0, 600), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(-750, 0, 700), size: new Vector2(70, 100) },
    { entities: [EntityTypes.Ylside], position: new Vector3(-750, 0, 800), size: new Vector2(70, 100) },
  ]

  const entitySpawners = entitySpawns.map((entitySpawnProps) => {
    return createEntitySpawner(entitySpawnProps)
  })

  map.entities.push(...entitySpawners)

  const rootStar = createRootStar()
  map.entities.push(rootStar)

  const sunAt = new Vector3(1000, -600, 3000)

  const platformUnderTheSun = createPlaneMesh({
    size: 100,
    texture: Texture.alpha,
  })
  platformUnderTheSun.position.x = sunAt.x
  platformUnderTheSun.position.y = sunAt.y + 1000
  platformUnderTheSun.position.z = sunAt.z
  map.polygons.addThreeJsMesh(platformUnderTheSun)

  const sun = createStar({
    size: 200,
    position: sunAt,
    orientation: new Rotation(0, MathUtils.degToRad(90), 0),
  })
  map.entities.push(sun)

  // -------------------------

  gameState.script?.on('goto_level1', () => {
    return `sendevent setsize player 50`
  })

  // randomly place the player on the map
  gameState.script?.on('goto_level1', () => {
    return `
set §tmp ^rnd_${playerSpawnPoints.length}

${playerSpawnPoints
  .map((spawn, index) => {
    return `if (§tmp == ${index}) { teleport -p ${spawn.ref} }`
  })
  .join('\n')}
`
  })

  gameState.script?.on('goto_level1', () => {
    return `
${entitySpawners
  .map((spawner) => {
    return `sendevent spawn_entity ${spawner.ref} nop`
  })
  .join('\n')}
`
  })

  if (settings.mode === 'production') {
    gameState.script?.on('goto_level1', () => {
      const { delay } = useDelay()
      return `
worldfade in 2000
${sfxPlayerAppears4SoundScript.play()}
${PlayerControls.on} ${delay(100)} ${PlayerControls.off} ${delay(1500)} ${PlayerControls.on}
  `
    })
  }

  const tmp = new ScriptSubroutine(
    'victory_cleanup_level1',
    () => {
      return `
${entitySpawners
  .map((spawner) => {
    return `sendevent remove_entity ${spawner.ref} nop`
  })
  .join('\n')}

sendevent reset ${sun.ref} nop
`
    },
    'goto',
  )

  gameState.script?.subroutines.push(tmp)

  gameState.script?.on('victory', () => {
    const { delay } = useDelay()
    return `
${delay(5500)} ${tmp.invoke()}
`
  })

  // -------------------------

  return map
}
