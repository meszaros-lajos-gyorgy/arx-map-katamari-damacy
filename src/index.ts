import { ArxMap, HudElements, QUADIFY, Settings, SHADING_SMOOTH, Vector3 } from 'arx-level-generator'
import { createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { createLight } from 'arx-level-generator/tools'
import { applyTransformations, isBetween } from 'arx-level-generator/utils'
import { pickWeightedRandoms, randomBetween } from 'arx-level-generator/utils/random'
import { Mesh } from 'three'
import { createConsumable, createRootConsumable, ConsumableTypes } from './entities/consumable.js'
import { createGameState } from './entities/gameState.js'
import { enhancePlayer } from './entities/player.js'

const settings = new Settings()
const map = new ArxMap()

map.config.offset = new Vector3(4000, 0, 4000)

map.hud.hide(HudElements.Minimap)
map.hud.hide(HudElements.HerosayIcon)

await map.i18n.addFromFile('./i18n.json', settings)

// -----------------------

const meshes: Mesh[] = []

const plane = createPlaneMesh({
  size: 4000,
})
meshes.push(plane)

// -----------------------

const gameState = createGameState()
map.entities.push(gameState)

map.player.withScript()
enhancePlayer(map.player, gameState)

const rootNpc = createRootConsumable()
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
  { value: ConsumableTypes.Ylside, weight: 10 },
  { value: ConsumableTypes.GoblinLord, weight: 30 },
  { value: ConsumableTypes.Goblin, weight: 60 },
]

const smalls = pickWeightedRandoms(100, npcDistribution)
const mediums = pickWeightedRandoms(50, npcDistribution)
const larges = pickWeightedRandoms(30, npcDistribution)
const extraLarges = pickWeightedRandoms(7, npcDistribution)

map.entities.push(
  ...smalls.map(({ value }) => {
    return createConsumable({
      position: createRandomPosition(),
      sizeRange: { min: 20, max: 50 },
      type: value,
    })
  }),
  ...mediums.map(({ value }) => {
    return createConsumable({
      position: createRandomPosition(),
      sizeRange: { min: 40, max: 125 },
      type: value,
    })
  }),
  ...larges.map(({ value }) => {
    return createConsumable({
      position: createRandomPosition(),
      sizeRange: { min: 100, max: 250 },
      type: value,
    })
  }),
  ...extraLarges.map(({ value }) => {
    return createConsumable({
      position: createRandomPosition(),
      sizeRange: { min: 200, max: 300 },
      type: value,
    })
  }),
)

// -----------------------

const boss = createConsumable({
  position: createRandomPosition(),
  sizeRange: { min: 300, max: 300 },
  type: ConsumableTypes.GoblinKing,
})
boss.script?.on('consumed', () => {
  return `sendevent victory ${gameState.ref} nop`
})
map.entities.push(boss)

// -----------------------

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

// -----------------------

// meshes.push(
//   createBox({
//     position: new Vector3(0, -50, 300),
//     size: new Vector3(100, 100, 100),
//     texture: Texture.uvDebugTexture,
//   }),
//   createBox({
//     position: new Vector3(0, -150, 300),
//     size: new Vector3(100, 100, 100),
//     texture: Texture.uvDebugTexture,
//   }),
//   // createBox({
//   //   position: new Vector3(0, -250, 300),
//   //   size: new Vector3(100, 100, 100),
//   //   texture: Texture.uvDebugTexture,
//   // }),
// )

// const entity = new Entity({
//   src: 'npc/goblin_base',
//   position: new Vector3(0, 0, 250),
// })
// entity.withScript()
// entity.script?.on('load', () => {
//   return `USE_MESH "Goblin_king\\Goblin_king.teo"`
// })

// map.entities.push(entity)

// -----------------------

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

// -----------------------

map.finalize(settings)
map.saveToDisk(settings)
