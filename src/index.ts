import { ArxMap, HudElements, QUADIFY, Settings, SHADING_SMOOTH, Texture, Vector3 } from 'arx-level-generator'
import { createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { useDelay } from 'arx-level-generator/scripting/hooks'
import { Shadow, Speed, Variable } from 'arx-level-generator/scripting/properties'
import { applyTransformations, isBetween } from 'arx-level-generator/utils'
import { randomBetween } from 'arx-level-generator/utils/random'
import { createNpc } from './prefabs/npc.js'

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

map.player.withScript()
map.player.script?.properties.push(new Speed(1.5), Shadow.off, playerSize)
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
herosay "player size: ~${playerSize.name}~cm"
herosay " "
herosay " "
herosay " "
    `
  })

map.hud.hide(HudElements.HerosayIcon)

// -----------------------

for (let i = 0; i < 110; i++) {
  const position = new Vector3(0, 0, 0)
  while (isBetween(-150, 150, position.x) && isBetween(-150, 150, position.z)) {
    position.x = randomBetween(-1500, 1500)
    position.z = randomBetween(-1500, 1500)
  }

  const blob = createNpc({ position, size: { min: 15, max: 50 } })
  map.entities.push(blob)
}

for (let i = 0; i < 50; i++) {
  const position = new Vector3(0, 0, 0)
  while (isBetween(-150, 150, position.x) && isBetween(-150, 150, position.z)) {
    position.x = randomBetween(-1500, 1500)
    position.z = randomBetween(-1500, 1500)
  }

  const blob = createNpc({ position, size: { min: 50, max: 150 } })
  map.entities.push(blob)
}

for (let i = 0; i < 30; i++) {
  const position = new Vector3(0, 0, 0)
  while (isBetween(-150, 150, position.x) && isBetween(-150, 150, position.z)) {
    position.x = randomBetween(-1500, 1500)
    position.z = randomBetween(-1500, 1500)
  }

  const blob = createNpc({ position, size: { min: 150, max: 300 } })
  map.entities.push(blob)
}

for (let i = 0; i < 3; i++) {
  const position = new Vector3(0, 0, 0)
  while (isBetween(-150, 150, position.x) && isBetween(-150, 150, position.z)) {
    position.x = randomBetween(-1000, 1000)
    position.z = randomBetween(-1000, 1000)
  }

  const blob = createNpc({ position, size: { min: 300, max: 1000 } })
  map.entities.push(blob)
}

// -----------------------

map.finalize(settings)
map.saveToDisk(settings)
