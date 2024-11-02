import {
  ArxMap,
  Entity,
  HudElements,
  Light,
  QUADIFY,
  Settings,
  SHADING_SMOOTH,
  Vector3,
  Zone,
} from 'arx-level-generator'
import { applyTransformations, isBetween } from 'arx-level-generator/utils'
import { pickWeightedRandoms, randomBetween } from 'arx-level-generator/utils/random'
import { Mesh } from 'three'
import { createEntity, createRootEntity, EntityTypes } from './entities/entity.js'
import { createGameState } from './entities/gameState.js'
import { enhancePlayer } from './entities/player.js'
import { createMap1 } from './places/map1/map1.js'

const settings = new Settings()
const map = new ArxMap()

map.config.offset = new Vector3(4000, 0, 4000)

map.hud.hide(HudElements.Minimap)
map.hud.hide(HudElements.HerosayIcon)

await map.i18n.addFromFile('./i18n.json', settings)

// -----------------------

const entities: Entity[] = []
const lights: Light[] = []
const meshes: Mesh[] = []
const zones: Zone[] = []

// -----------------------

const map1 = createMap1()

entities.push(...map1.entities)
lights.push(...map1.lights)
meshes.push(...map1.meshes)
zones.push(...map1.zones)

// -----------------------

const gameState = createGameState()
map.entities.push(gameState)

map.player.withScript()
enhancePlayer(map.player, gameState)

const rootNpc = createRootEntity()
map.entities.push(rootNpc)

// -----------------------

function createRandomPosition() {
  const position = new Vector3(0, 0, 0)
  while (isBetween(-150, 150, position.x) && isBetween(-150, 150, position.z)) {
    position.x = randomBetween(-1500, 1500)
    position.z = randomBetween(-1500, 1500)
  }
  return position
}

const npcDistribution = [
  { value: EntityTypes.Ylside, weight: 10 },
  { value: EntityTypes.Carrot, weight: 20 },
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

// -----------------------

const boss = createEntity({
  position: createRandomPosition(),
  size: 300,
  type: EntityTypes.GoblinKing,
})
boss.script?.on('consumed', () => {
  return `sendevent victory ${gameState.ref} nop`
})
map.entities.push(boss)

// -----------------------

/*
meshes.push(
  createBox({
    position: new Vector3(0, -50, 300),
    size: new Vector3(100, 100, 100),
    texture: Texture.uvDebugTexture,
  }),
  createBox({
    position: new Vector3(0, -150, 300),
    size: new Vector3(100, 100, 100),
    texture: Texture.uvDebugTexture,
  }),
  // createBox({
  //   position: new Vector3(0, -250, 300),
  //   size: new Vector3(100, 100, 100),
  //   texture: Texture.uvDebugTexture,
  // }),
)

const entity = new Entity({
  src: 'items/provisions/carrot',
  position: new Vector3(0, -30, 250),
  orientation: new Rotation(0, 0, MathUtils.degToRad(-90)),
})
entity.withScript()
// entity.script?.on('load', () => {
//   return `USE_MESH "Goblin_king\\Goblin_king.teo"`
// })

map.entities.push(entity)
*/

// -----------------------

map.entities.push(...entities)

map.lights.push(...lights)

meshes.forEach((mesh) => {
  applyTransformations(mesh)
  mesh.translateX(map.config.offset.x)
  mesh.translateY(map.config.offset.y)
  mesh.translateZ(map.config.offset.z)
  applyTransformations(mesh)

  map.polygons.addThreeJsMesh(mesh, {
    tryToQuadify: QUADIFY,
    shading: SHADING_SMOOTH,
  })
})

map.zones.push(...zones)

// -----------------------

map.finalize(settings)
map.saveToDisk(settings)
