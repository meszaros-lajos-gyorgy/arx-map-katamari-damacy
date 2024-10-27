import { ArxMap, HudElements, QUADIFY, Settings, SHADING_SMOOTH, Vector3 } from 'arx-level-generator'
import { createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { ScriptSubroutine } from 'arx-level-generator/scripting'
import { Shadow, Speed, Variable } from 'arx-level-generator/scripting/properties'
import { createLight } from 'arx-level-generator/tools'
import { applyTransformations, isBetween } from 'arx-level-generator/utils'
import { randomBetween } from 'arx-level-generator/utils/random'
import { Mesh } from 'three'
import { createGameState } from './prefabs/gamestate.js'
import { createNpc, createRootNpc, NpcTypes } from './prefabs/npc.js'

const settings = new Settings()
const map = new ArxMap()

map.config.offset = new Vector3(4000, 0, 4000)

map.hud.hide(HudElements.Minimap)

// -----------------------

const meshes: Mesh[] = []

const plane = createPlaneMesh({
  size: 4000,
})
meshes.push(plane)

// -----------------------

const gameState = createGameState()
map.entities.push(gameState)

const size = new Variable('float', 'size', 50) // real height of the model (centimeters)
const baseHeight = new Variable('int', 'base_height', 180) // model height (centimeters)
const scaleFactor = new Variable('float', 'scale_factor', 0, true) // value to be passed to setscale command (percentage)
const tmp = new Variable('float', 'tmp', 0, true) // helper for calculations

map.player.withScript()

map.player.script?.properties.push(new Speed(1.5), Shadow.off, size, baseHeight, scaleFactor, tmp)

const resize = new ScriptSubroutine(
  'resize',
  () => {
    return `
// scaleFactor % = (playerSize cm / playerBaseHeight cm) * 100
set ${scaleFactor.name} ${size.name}
div ${scaleFactor.name} ${baseHeight.name}
mul ${scaleFactor.name} 100

setscale ${scaleFactor.name}
sendevent player_resized ${gameState.ref} ~${size.name}~
`
  },
  'gosub',
)
map.player.script?.subroutines.push(resize)

map.player.script
  ?.on('initend', () => {
    return `
${resize.invoke()}
    `
  })
  .on('grow', () => {
    return `
// size cm += args[0] cm / 50
set ${tmp.name} ^&param1
div ${tmp.name} 50
inc ${size.name} ${tmp.name}

${resize.invoke()}
`
  })

map.hud.hide(HudElements.HerosayIcon)

// -----------------------

function createRandomPosition() {
  const position = new Vector3(0, 0, 0)
  while (isBetween(-150, 150, position.x) && isBetween(-150, 150, position.z)) {
    position.x = randomBetween(-1500, 1500)
    position.z = randomBetween(-1500, 1500)
  }
  return position
}

const rootNpc = createRootNpc()
map.entities.push(rootNpc)

// TODO: weighted randoms

for (let i = 0; i < 110; i++) {
  let type: NpcTypes = NpcTypes.Goblin
  const chance = randomBetween(0, 100)
  if (chance < 10) {
    type = NpcTypes.Ylside
  } else if (chance < 30) {
    type = NpcTypes.GoblinLord
  }

  const npc = createNpc({ position: createRandomPosition(), sizeRange: { min: 15, max: 50 }, type })
  map.entities.push(npc)
}

for (let i = 0; i < 50; i++) {
  let type: NpcTypes = NpcTypes.Goblin
  const chance = randomBetween(0, 100)
  if (chance < 10) {
    type = NpcTypes.Ylside
  } else if (chance < 30) {
    type = NpcTypes.GoblinLord
  }

  const npc = createNpc({ position: createRandomPosition(), sizeRange: { min: 40, max: 150 }, type })
  map.entities.push(npc)
}

for (let i = 0; i < 30; i++) {
  let type: NpcTypes = NpcTypes.Goblin
  const chance = randomBetween(0, 100)
  if (chance < 10) {
    type = NpcTypes.Ylside
  } else if (chance < 30) {
    type = NpcTypes.GoblinLord
  }

  const npc = createNpc({ position: createRandomPosition(), sizeRange: { min: 100, max: 300 }, type })
  map.entities.push(npc)
}

for (let i = 0; i < 3; i++) {
  let type: NpcTypes = NpcTypes.Goblin
  const chance = randomBetween(0, 100)
  if (chance < 10) {
    type = NpcTypes.Ylside
  } else if (chance < 30) {
    type = NpcTypes.GoblinLord
  }

  const npc = createNpc({ position: createRandomPosition(), sizeRange: { min: 200, max: 300 }, type })
  map.entities.push(npc)
}

// -----------------------

const boss = createNpc({
  position: createRandomPosition(),
  sizeRange: { min: 300, max: 300 },
  type: NpcTypes.GoblinKing,
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
