import { ArxMap, Audio, Entity, HudElements, QUADIFY, Settings, SHADING_SMOOTH, Vector3 } from 'arx-level-generator'
import { createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { Sound, SoundFlags } from 'arx-level-generator/scripting/classes'
import { useDelay } from 'arx-level-generator/scripting/hooks'
import { Collision, Interactivity, Shadow, Speed, Variable } from 'arx-level-generator/scripting/properties'
import { applyTransformations, isBetween } from 'arx-level-generator/utils'
import { randomBetween } from 'arx-level-generator/utils/random'
import { MathUtils } from 'three'

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

const eatSound = new Audio({
  filename: 'eat.wav',
  isNative: true,
  type: 'sfx',
})
const eatSoundScript = new Sound(eatSound.filename, SoundFlags.VaryPitch)

async function createBlob(position: Vector3, size: { min: number; max: number }) {
  const blob = new Entity({
    src: 'npc/goblin_base',
  })

  blob.position = position
  blob.orientation.y = MathUtils.degToRad(randomBetween(-90, 90))

  blob.withScript()

  const scale = new Variable('float', 'scale', 0, true)
  const isConsumable = new Variable('bool', 'is_consumable', false)

  blob.script?.properties.push(Collision.on, Shadow.off, Interactivity.off, scale, isConsumable)
  blob.script
    ?.on('initend', () => {
      return `
setweapon "none"
setgroup blob
set_event collide_npc on

set ${scale.name} ^rnd_${size.max - size.min}
inc ${scale.name} ${size.min}

setscale ${scale.name}
      `
    })
    .on('scale_threshold_change', () => {
      const tmp = new Variable('float', 'tmp', 0, true)
      return `
if (${scale.name} < ^&param1) {
  set ${isConsumable.name} 1
} else {
  set ${isConsumable.name} 0
}

set ${tmp.name} ^&param1
mul ${tmp.name} 3
if (${scale.name} > ${tmp.name}) {
  ${Collision.off}
} else {
  ${Collision.on}
}
      `
    })
    .on('collide_npc', () => {
      const { delay } = useDelay()
      return `
if (${isConsumable.name} == 1) {
  sendevent grow player ~${scale.name}~
  ${Collision.off}
  ${eatSoundScript.play()}
  objecthide self on
  ${delay(100)} destroy self
} else {
  random 50 {
    speak [goblin_ouch]
  }
}
      `
    })

  return blob
}

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

// -----------------------

for (let i = 0; i < 110; i++) {
  const position = new Vector3(0, 0, 0)
  while (isBetween(-150, 150, position.x) && isBetween(-150, 150, position.z)) {
    position.x = randomBetween(-1500, 1500)
    position.z = randomBetween(-1500, 1500)
  }

  const blob = await createBlob(position, { min: 15, max: 50 })
  map.entities.push(blob)
}

for (let i = 0; i < 50; i++) {
  const position = new Vector3(0, 0, 0)
  while (isBetween(-150, 150, position.x) && isBetween(-150, 150, position.z)) {
    position.x = randomBetween(-1500, 1500)
    position.z = randomBetween(-1500, 1500)
  }

  const blob = await createBlob(position, { min: 50, max: 150 })
  map.entities.push(blob)
}

for (let i = 0; i < 30; i++) {
  const position = new Vector3(0, 0, 0)
  while (isBetween(-150, 150, position.x) && isBetween(-150, 150, position.z)) {
    position.x = randomBetween(-1500, 1500)
    position.z = randomBetween(-1500, 1500)
  }

  const blob = await createBlob(position, { min: 150, max: 300 })
  map.entities.push(blob)
}

for (let i = 0; i < 3; i++) {
  const position = new Vector3(0, 0, 0)
  while (isBetween(-150, 150, position.x) && isBetween(-150, 150, position.z)) {
    position.x = randomBetween(-1000, 1000)
    position.z = randomBetween(-1000, 1000)
  }

  const blob = await createBlob(position, { min: 300, max: 1000 })
  map.entities.push(blob)
}

// -----------------------

map.finalize(settings)
map.saveToDisk(settings)
