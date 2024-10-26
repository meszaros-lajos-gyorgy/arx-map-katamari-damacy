import { Audio, Entity, Vector3 } from 'arx-level-generator'
import { Sound, SoundFlags } from 'arx-level-generator/scripting/classes'
import { useDelay } from 'arx-level-generator/scripting/hooks'
import { Collision, Interactivity, Invulnerability, Shadow, Variable } from 'arx-level-generator/scripting/properties'
import { randomBetween } from 'arx-level-generator/utils/random'
import { MathUtils } from 'three'

// -----------------

const consumeSound = new Audio({
  filename: 'eat.wav',
  isNative: true,
  type: 'sfx',
})

const consumeSoundScript = new Sound(consumeSound.filename, SoundFlags.VaryPitch)

// -----------------

// TODO: https://github.com/arx-tools/arx-level-generator/issues/35
const collisionSoundScript = {
  play: () => `speak [goblin_ouch]`,
}

// -----------------

type createNpcProps = {
  position: Vector3
  size: { min: number; max: number }
}

export function createNpc({ position, size }: createNpcProps) {
  const entity = new Entity({
    src: 'npc/goblin_base',
  })

  entity.position = position
  entity.orientation.y = MathUtils.degToRad(randomBetween(-90, 90))

  entity.withScript()

  const scale = new Variable('float', 'scale', 0, true)
  const isConsumable = new Variable('bool', 'is_consumable', false)

  entity.script?.properties.push(Collision.on, Shadow.off, Interactivity.off, scale, isConsumable)
  entity.script
    ?.on('initend', () => {
      return `
setweapon "none"
setgroup blob
set_event collide_npc on
${Invulnerability.on}

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
  ${consumeSoundScript.play()}
  objecthide self on
  ${delay(100)} destroy self
} else {
  random 50 {
    ${collisionSoundScript.play()}
  }
}
      `
    })
    .on('aggression', () => {
      return `refuse`
    })

  return entity
}
