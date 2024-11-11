import {
  Ambience,
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
import { ScriptSubroutine } from 'arx-level-generator/scripting'
import { useDelay } from 'arx-level-generator/scripting/hooks'
import { PlayerControls, Variable } from 'arx-level-generator/scripting/properties'
import { createLight, createZone } from 'arx-level-generator/tools'
import { pickRandom, pickWeightedRandoms, randomBetween } from 'arx-level-generator/utils/random'
import { MathUtils, Vector2 } from 'three'
import { createEntity, EntityTypes } from '@/entities/entity.js'
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
import { createCityWest } from '../../../meshPrefabs/cityWest.js'

export async function createLevel1(gameState: Entity, settings: Settings): Promise<ArxMap> {
  const map = new ArxMap()

  // const cityWest = await createCityWest(settings)
  // map.add(cityWest)

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

  /*
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
  */

  // -------------------------

  const eveningSky = Color.fromCSS('#582402')

  /*
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
  */

  // -------------------------

  const spawnZone1 = createZone({
    name: 'level1_spawn1',
    size: new Vector3(100, 100, 100),
    backgroundColor: eveningSky,
    ambience: Ambience.rebelsCool,
    drawDistance: 7000,
  })
  map.zones.push(spawnZone1)

  // TODO: add more spawns
  const spawn1 = Entity.marker
  map.entities.push(spawn1)

  const spawns: Entity[] = [spawn1]
  const spawnPoints = spawns.map(({ position }) => position)

  // -------------------------

  /*
  const npcDistribution = [
    { value: EntityTypes.Ylside, weight: 20 },
    { value: EntityTypes.Carrot, weight: 20 },
    { value: EntityTypes.Leek, weight: 20 },
    { value: EntityTypes.GoblinLord, weight: 30 },
    { value: EntityTypes.Goblin, weight: 60 },
    { value: EntityTypes.Cheese, weight: 10 },
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
  */

  // -------------------------

  const rootStar = createRootStar()
  map.entities.push(rootStar)

  const sunAt = new Vector3(1500, 70, 3000)

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
    orientation: new Rotation(0, MathUtils.degToRad(-90), 0),
  })
  map.entities.push(sun)

  const anchorA = Entity.marker.withScript().at({
    position: new Vector3(-2000, 0, 2000).adjustToPlayerHeight(),
  })
  anchorA.script?.on('init', () => {
    const { loop } = useDelay()
    return `${loop(50)} sendevent dist_player_a ${sun.ref} "~^&playerdist~"`
  })

  const anchorB = Entity.marker.withScript().at({
    position: new Vector3(2000, 0, 2000).adjustToPlayerHeight(),
  })
  anchorB.script?.on('init', () => {
    const { loop } = useDelay()
    return `${loop(50)} sendevent dist_player_b ${sun.ref} "~^&playerdist~"`
  })

  const anchorC = Entity.marker.withScript().at({
    position: new Vector3(-2000, 0, -2000).adjustToPlayerHeight(),
  })
  anchorC.script?.on('init', () => {
    const { loop } = useDelay()
    return `${loop(50)} sendevent dist_player_c ${sun.ref} "~^&playerdist~"`
  })

  map.entities.push(anchorA, anchorB, anchorC)

  const varDistPlayerA = new Variable('float', 'dist_player_a', -1)
  const varDistPlayerB = new Variable('float', 'dist_player_b', -1)
  const varDistPlayerC = new Variable('float', 'dist_player_c', -1)
  const varPrevX = new Variable('float', 'prev_x', -1)
  const varPrevZ = new Variable('float', 'prev_z', -1)
  const varX = new Variable('float', 'x', -1)
  const varZ = new Variable('float', 'z', -1)
  const varTmp = new Variable('float', 'tmp', 0, true)
  const varAdjustPos = new Variable('bool', 'adjust_pos', false)
  sun.script?.properties.push(
    varDistPlayerA,
    varDistPlayerB,
    varDistPlayerC,
    varPrevX,
    varPrevZ,
    varX,
    varZ,
    varTmp,
    varAdjustPos,
  )

  // min(z): 0
  // max(z): 4472.135955
  // 4472.135955 / 4000 = 1.118033989 (sqrt(1.25) or golden ratio - 0.5)
  // see https://friesian.com/golden.htm

  const measurePosition = new ScriptSubroutine('measure_position', () => {
    return `
if (${varAdjustPos.name} == 0) {
  accept
}

set ${varX.name} ${varDistPlayerA.name}
inc ${varX.name} ${varDistPlayerC.name}
dec ${varX.name} 4000
div ${varX.name} 1.118

set ${varZ.name} ${varDistPlayerA.name}
inc ${varZ.name} ${varDistPlayerB.name}
dec ${varZ.name} 4000
div ${varZ.name} 1.118

if (${varPrevX.name} != -1) {
  dec ${varPrevX.name} ${varX.name}
  mul ${varPrevX.name} -1
  move ~${varPrevX.name}~ 0 0
}
set ${varPrevX.name} ${varX.name}

if (${varPrevZ.name} != -1) {
  dec ${varPrevZ.name} ${varZ.name}
  move 0 0 ~${varPrevZ.name}~
}
set ${varPrevZ.name} ${varZ.name}
`
  })
  sun.script?.subroutines.push(measurePosition)

  sun.script
    ?.on('dist_player_a', () => {
      return `set ${varDistPlayerA.name} ^&param1`
    })
    .on('dist_player_b', () => {
      return `set ${varDistPlayerB.name} ^&param1`
    })
    .on('dist_player_c', () => {
      return `set ${varDistPlayerC.name} ^&param1`
    })
    .on('init', () => {
      const { loop } = useDelay()
      return `${loop(100)} ${measurePosition.invoke()}`
    })
    .on('start_adjusting', () => {
      return `set ${varAdjustPos.name} 1`
    })
    .on('stop_adjusting', () => {
      return `set ${varAdjustPos.name} 0`
    })

  /*
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

      const star = createStar({
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

      const star = createStar({
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

      const star = createStar({
        size,
        position: starAt,
      })
      map.entities.push(star)
    }
  }
  */

  // -------------------------

  gameState.script
    ?.on('goto_level1', () => {
      const { delay } = useDelay()
      return `
sendevent setsize player 50
set §tmp ^rnd_${spawns.length}

${delay(1000, false)} sendevent start_adjusting ${sun.ref} nop

${spawns
  .map((spawn, index) => {
    return `
if (§tmp == ${index}) {
  teleport -p ${spawn.ref}
}
`
  })
  .join('\n')}
// TODO: reset entities
`
    })
    .on('goto_level1', () => {
      const { delay } = useDelay()
      if (settings.mode === 'production') {
        return `
worldfade in 2000
${sfxPlayerAppears4SoundScript.play()}
${PlayerControls.on} ${delay(100)} ${PlayerControls.off} ${delay(1500)} ${PlayerControls.on}
`
      } else {
        return ''
      }
    })
    .on('victory', () => {
      return `
sendevent stop_adjusting ${sun.ref} nop
`
    })

  // -------------------------

  return map
}
