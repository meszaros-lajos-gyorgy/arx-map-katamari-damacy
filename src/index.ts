import { ArxMap, HudElements, QUADIFY, Settings, SHADING_SMOOTH, Texture, Vector3 } from 'arx-level-generator'
import { createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { useDelay } from 'arx-level-generator/scripting/hooks'
import { PlayerControls, Shadow, Speed, Variable } from 'arx-level-generator/scripting/properties'
import { applyTransformations, isBetween } from 'arx-level-generator/utils'
import { pickRandom, randomBetween } from 'arx-level-generator/utils/random'
import { createNpc, createRootNpc, NpcTypes } from './prefabs/npc.js'

const settings = new Settings()
const map = new ArxMap()

map.config.offset = new Vector3(4000, 0, 4000)

map.hud.hide(HudElements.Minimap)

// -----------------------

const mesh = createPlaneMesh({
  size: 4000,
})

applyTransformations(mesh)
mesh.translateX(map.config.offset.x)
mesh.translateY(map.config.offset.y)
mesh.translateZ(map.config.offset.z)
applyTransformations(mesh)

map.polygons.addThreeJsMesh(mesh, {
  tryToQuadify: QUADIFY,
  shading: SHADING_SMOOTH,
})

// -----------------------

const playerSize = new Variable('float', 'size', 30)
const hudLine1 = new Variable('string', 'hud_line_1', ' ')
const hudLine2 = new Variable('string', 'hud_line_2', ' ')
const hudLine3 = new Variable('string', 'hud_line_3', ' ')
const hudLine4 = new Variable('string', 'hud_line_4', ' ')

map.player.withScript()
map.player.script?.properties.push(new Speed(1.5), Shadow.off, playerSize, hudLine1, hudLine2, hudLine3, hudLine4)

map.player.script
  ?.on('init', () => {
    const { delay } = useDelay()
    return `
setscale ${playerSize.name}
${delay(500)} sendevent -g blob scale_threshold_change ~${playerSize.name}~
`
  })
  .on('grow', () => {
    const tmp = new Variable('float', 'tmp', 0, true)
    return `
set ${tmp.name} ^&param1
div ${tmp.name} 50
inc ${playerSize.name} ${tmp.name}

setscale ${playerSize.name}
sendevent -g blob scale_threshold_change ~${playerSize.name}~
`
  })
  .on('main', () => {
    return `
set ${hudLine1.name} "player size: ~${playerSize.name}~cm"

herosay ${hudLine1.name}
herosay ${hudLine2.name}
herosay ${hudLine3.name}
herosay ${hudLine4.name}
    `
  })
  .on('victory', () => {
    return `
set ${hudLine2.name} "You've won!!"
${PlayerControls.off}
    `
  })

map.hud.hide(HudElements.HerosayIcon)

// -----------------------

const rootNpc = createRootNpc()
map.entities.push(rootNpc)

for (let i = 0; i < 110; i++) {
  const position = new Vector3(0, 0, 0)
  while (isBetween(-150, 150, position.x) && isBetween(-150, 150, position.z)) {
    position.x = randomBetween(-1500, 1500)
    position.z = randomBetween(-1500, 1500)
  }

  let type: NpcTypes = 'goblin_base'
  if (randomBetween(0, 100) < 10) {
    type = 'goblin_lord'
  }

  const npc = createNpc({ position, size: { min: 15, max: 50 }, type })
  map.entities.push(npc)
}

for (let i = 0; i < 50; i++) {
  const position = new Vector3(0, 0, 0)
  while (isBetween(-150, 150, position.x) && isBetween(-150, 150, position.z)) {
    position.x = randomBetween(-1500, 1500)
    position.z = randomBetween(-1500, 1500)
  }

  let type: NpcTypes = 'goblin_base'
  if (randomBetween(0, 100) < 10) {
    type = 'goblin_lord'
  }

  const npc = createNpc({ position, size: { min: 40, max: 150 }, type })
  map.entities.push(npc)
}

for (let i = 0; i < 30; i++) {
  const position = new Vector3(0, 0, 0)
  while (isBetween(-150, 150, position.x) && isBetween(-150, 150, position.z)) {
    position.x = randomBetween(-1500, 1500)
    position.z = randomBetween(-1500, 1500)
  }

  let type: NpcTypes = 'goblin_base'
  if (randomBetween(0, 100) < 10) {
    type = 'goblin_lord'
  }

  const npc = createNpc({ position, size: { min: 100, max: 300 }, type })
  map.entities.push(npc)
}

for (let i = 0; i < 3; i++) {
  const position = new Vector3(0, 0, 0)
  while (isBetween(-150, 150, position.x) && isBetween(-150, 150, position.z)) {
    position.x = randomBetween(-1000, 1000)
    position.z = randomBetween(-1000, 1000)
  }

  let type: NpcTypes = 'goblin_base'
  if (randomBetween(0, 100) < 10) {
    type = 'goblin_lord'
  }

  const npc = createNpc({ position, size: { min: 200, max: 300 }, type })
  map.entities.push(npc)
}

// -----------------------

const position = new Vector3(0, 0, 0)
while (isBetween(-150, 150, position.x) && isBetween(-150, 150, position.z)) {
  position.x = randomBetween(-1000, 1000)
  position.z = randomBetween(-1000, 1000)
}

const boss = createNpc({ position, size: { min: 200, max: 300 }, type: 'goblin_king' })
boss.script?.on('consumed', () => {
  return `sendevent victory player nop`
})
map.entities.push(boss)

// -----------------------

map.finalize(settings)
map.saveToDisk(settings)
